import { BranchDBResponse } from "./types";

const PAYLOAD_TYPE = {
  MONOSTATE: 0,
  STRING: 1,
  VECTOR_STRING: 2,
};

export const deserializeResponse = (data: any): BranchDBResponse => {
  let offset = 0;

  const status_code = data.readInt32LE(offset);
  offset += 4;

  const success = data.readUInt8(offset);
  offset += 1;

  const message_len = data.readUInt32LE(offset);
  offset += 4;

  const message = data.toString("utf8", offset, offset + message_len);
  offset += message_len;

  const payload_type = data.readUInt8(offset);
  offset += 1;

  let payload = null;

  if (payload_type === PAYLOAD_TYPE.MONOSTATE) {
    const payload_len = data.readUInt32LE(offset);
    offset += 4;
    payload = null;
  } else if (payload_type === PAYLOAD_TYPE.STRING) {
    const payload_len = data.readUint32LE(offset);
    offset += 4;
    payload = data.toString("utf8", offset, offset + payload_len);
    payload = JSON.parse(payload);
    offset += payload_len;
  } else if (payload_type === PAYLOAD_TYPE.VECTOR_STRING) {
    const vector_size = data.readUint32LE(offset);
    offset += 4;

    const string_array = [];
    for (let i = 0; i < vector_size; i++) {
      const str_len = data.readUInt32LE(offset);
      offset += 4;

      const str = data.toString("utf8", offset, offset + str_len);
      offset += str_len;
      string_array.push(str);
    }
    payload = string_array;
  }

  const response = {
    statusCode: status_code,
    success: success,
    message: message,
    payloadType: payload_type,
    payload: payload,
  };
  return response;
};
