export = <T>(
  func: (callback: (err?: Error | null, result?: T) => void) => void,
) => new Promise<T>(
  (resolve, reject) => func((err, result) => (err ? reject(err) : resolve(result))),
);
