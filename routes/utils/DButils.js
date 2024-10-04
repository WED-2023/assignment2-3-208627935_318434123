require("dotenv").config();
const MySql = require("./MySql");

// exports.execQuery = async function (query) {
//   let returnValue = []
//   const connection = await MySql.connection();
//   console.log('Connection status:', connection);
//   try {
//   resualt = await connection.query("START TRANSACTION");
//   console.log("connection is:", resualt)
//   returnValue = await connection.query(query);
//   console.log("returned value: ", returnValue);
// } catch (err) {
//   await connection.query("ROLLBACK");
//   console.log('ROLLBACK at querySignUp', err);
//   throw err;
// } finally {
//   await connection.release();
// }
// return returnValue
// }
exports.execQuery = async function (query) {
  let returnValue = [];
  const conn = await MySql.connection(); // Get the connection

  try {
      // Start the transaction
      await conn.query("START TRANSACTION");
      
      // Execute the query
      returnValue = await conn.query(query); 

      // Check if the query was an INSERT and if any rows were affected
      if (returnValue.affectedRows > 0) {
          // Commit the transaction if rows were affected
          await conn.query("COMMIT");
          console.log('Transaction committed successfully.');
      } else {
          // If no rows were affected, roll back the transaction
        //   console.log('No rows affected, rolling back the transaction.');
          await conn.query("ROLLBACK");
      }
  } catch (err) {
      // If there's an error, roll back the transaction
      await conn.query("ROLLBACK");
    //   console.log('ROLLBACK due to error in execQuery:', err); // Improved logging
      throw err; // Rethrow the error for further handling
  } finally {
      // Ensure the connection is released back to the pool
      await conn.release(); 
  }
  return returnValue; // Return the results
};

