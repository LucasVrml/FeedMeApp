"use client";

export function useResponseMiddleware(
  response: { error?: any; data?: any },
  toast: Function
) {
  if (response.error) {
    toast({
      title: "Mince, il y a eu une erreur ...",
      description: `${JSON.stringify(response.error)}`,
      duration: 3500,
    });
    return null;
  } else if (response.data) {
    return response.data;
  } else {
    return true;
  }
}
