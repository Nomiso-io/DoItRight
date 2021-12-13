export const getDateTime = (UTCDate: any) => {
  let dateString = new Intl.DateTimeFormat('en-IN', {
    year: '2-digit',
    month: 'short',
    day: '2-digit',
  })
    .format(new Date(UTCDate))
    .toString()
    .replace(/\s/g, '-');
  let timeString = new Date(UTCDate).toTimeString().substring(0, 5);
  dateString = `${dateString}, ${timeString}`;
  return dateString;
};

export const getDelayDate = (date: any) => {
  let dateString = new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: '2-digit',
  })
    .format(new Date(date))
    .toString()
    .replace(/\s/g, ' ');
  return dateString;
};

export const getDate = (UTCDate: any) => {
  let dateString = new Intl.DateTimeFormat('en-IN', {
    year: '2-digit',
    month: 'short',
    day: '2-digit',
  })
    .format(new Date(UTCDate))
    .toString()
    .replace(/\s/g, '-');
  return dateString;
};

export const getFullDate = (date: any) => {
  let year = date.getFullYear();
  let month = date.toLocaleString('default', { month: 'short' });
  let day = ('0' + date.getDate()).slice(-2);
  const dateformat = `${day} ${month} ${year}`;
  return dateformat;
};

export const getUTCDate = (UTCDate: any) => {
  let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(UTCDate);
  let month = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(
    UTCDate
  );
  let date = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(UTCDate);
  const dateInUTC = Date.UTC(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(date)
  );
  return dateInUTC;
};

export const getTime = (milliseconds: any) => {
  let hours = `0${new Date(milliseconds).getHours() - 1}`.slice(-2);
  let minutes = `0${new Date(milliseconds).getMinutes()}`.slice(-2);
  let seconds = `0${new Date(milliseconds).getSeconds()}`.slice(-2);

  let time = `${hours}:${minutes}:${seconds}`;
  return time;
};
