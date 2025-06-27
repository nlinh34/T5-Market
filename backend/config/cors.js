const corsOptions = {
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", "https://t5-market.vercel.app" , "http://localhost:5501", "http://127.0.0.1:5501"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
