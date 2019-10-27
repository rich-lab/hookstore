export const repeat = (str: string, times: number): string => (new Array(times + 1)).join(str);

export const pad = (num: number, maxLength: number): string => repeat('0', maxLength - num.toString().length) + num;

export const formatTime = (time: Date): string => `${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(time.getSeconds(), 2)}.${pad(time.getMilliseconds(), 3)}`;
