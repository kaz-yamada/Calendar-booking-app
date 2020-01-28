import fs from "fs";

/**
 * Returns a promise when writing to a file
 * @param {*} filepath File path to write to
 * @param {*} data What to write in the file
 * @return {Promise} A promise
 */
export const writeFilePromise = (filepath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, error => {
      if (error) reject(error);
      resolve("file created successfully with handcrafted Promise!");
    });
  });
};

export const readFilePromise = filepath => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (error, data) => {
      if (error) reject(error);
      resolve(data);
    });
  });
};
