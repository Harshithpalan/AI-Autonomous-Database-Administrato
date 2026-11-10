import mysql from 'mysql2/promise'

let connection: mysql.Connection | null = null

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, query, params } = body

  try {
    // Handle connection
    if (action === 'connect') {
      if (connection) {
        await connection.end()
      }

      connection = await mysql.createConnection({
        host: params.host,
        port: params.port || 3306,
        user: params.user,
        password: params.password,
        database: params.database
      })

      return { success: true, message: 'Connected to MySQL database' }
    }

    // Handle query execution
    if (action === 'query') {
      if (!connection) {
        throw new Error('Not connected to database')
      }

      const [results] = await connection.execute(query)
      return { success: true, results }
    }

    // Handle backup (using mysqldump simulation)
    if (action === 'backup') {
      if (!connection) {
        throw new Error('Not connected to database')
      }

      // Get all tables
      const [tables] = await connection.execute('SHOW TABLES')
      const tableNames = (tables as any[]).map(t => Object.values(t)[0])

      // For each table, get the structure and data
      const backupData: any = {
        database: params.database,
        timestamp: new Date().toISOString(),
        tables: {}
      }

      for (const table of tableNames) {
        const [structure] = await connection.execute(`DESCRIBE ${table}`)
        const [data] = await connection.execute(`SELECT * FROM ${table} LIMIT 1000`)
        backupData.tables[table] = { structure, data }
      }

      return { success: true, backup: backupData }
    }

    // Handle query optimization
    if (action === 'optimize') {
      if (!connection) {
        throw new Error('Not connected to database')
      }

      const suggestions: string[] = []

      // Check for EXPLAIN
      const [explain] = await connection.execute(`EXPLAIN ${query}`)
      const explainRows = explain as any[]

      explainRows.forEach(row => {
        if (row.type === 'ALL') {
          suggestions.push('Warning: Full table scan detected. Consider adding an index.')
        }
        if (row.rows > 10000) {
          suggestions.push(`Warning: Query examines ${row.rows} rows. Consider optimizing the query or adding WHERE clause.`)
        }
        if (row.Extra && row.Extra.includes('Using filesort')) {
          suggestions.push('Warning: Using filesort. Consider adding an index to avoid sorting.')
        }
        if (row.Extra && row.Extra.includes('Using temporary')) {
          suggestions.push('Warning: Using temporary table. Consider rewriting the query.')
        }
      })

      // Check for SELECT *
      if (query.toLowerCase().includes('select *')) {
        suggestions.push('Tip: Avoid SELECT *. Specify only the columns you need.')
      }

      // Check for missing WHERE clause in DELETE/UPDATE
      if ((query.toLowerCase().includes('delete') || query.toLowerCase().includes('update')) && 
          !query.toLowerCase().includes('where')) {
        suggestions.push('Critical: DELETE/UPDATE without WHERE clause will affect all rows!')
      }

      return { success: true, suggestions, explain: explainRows }
    }

    // Handle disconnect
    if (action === 'disconnect') {
      if (connection) {
        await connection.end()
        connection = null
      }
      return { success: true, message: 'Disconnected from database' }
    }

    return { success: false, message: 'Unknown action' }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})
