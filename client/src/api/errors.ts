export class SomethingWrongError extends Error {
  constructor(
    status: number,
    msg = `Something went wrong. The status code: ${status}`
  ) {
    super(msg);
  }
}

export class UnexpectedDataError extends Error {
  constructor(msg = "Received data that did not pass validation") {
    super(msg);
  }
}
