export const appConfig = {
  mail: {
    enabled: process.env.PONDFLOW_MAIL_ENABLED === "true",
    host: process.env.PONDFLOW_SMTP_HOST || "",
    port: Number(process.env.PONDFLOW_SMTP_PORT || 587),
    user: process.env.PONDFLOW_SMTP_USER || "",
    password: process.env.PONDFLOW_SMTP_PASSWORD || "",
    from: process.env.PONDFLOW_MAIL_FROM || "",
  },
};
