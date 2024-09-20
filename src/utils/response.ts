import type { Response } from '../types';

const initialResponse: Response = {
  code: 200,
  msg: '',
  data: null,
};
export const response = (
  res: Response,
  { code, msg, data }: Response = initialResponse,
) => {
  res = {
    code,
    msg,
    data,
  };
};
