import instance from "./axiosInstance";

export const zkpVerifyLocally = (params: string) => {
  return instance.post(`/api/verify`, params, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "bearer",
    },
  });
};
