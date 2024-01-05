import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const port = 3000;
const hostname = "127.0.0.1";

const app = express();

app.get('/api', (_req, res) => {
  res.json({
    message: 'Welcome to the API!',
  });
});

interface User {
  _id: number,
  username: string,
  email: string,
}

// Declaration merging on JwtPayload (which is authData below)
declare module 'jsonwebtoken' {
  interface JwtPayload {
    user: User;
  }
}

app.post('/api/posts', verifyToken, (req, res) => {
  jwt.verify(req.token, 'secret key', (err, authData) => {
    // Narrow to JwtPayload by removing authData as undefined or string
    if (err || !authData || typeof authData === 'string') {
      return res.status(403).json({ error: 403, message: '403 Forbidden' })
    }

    res.json({
      message: 'Post created...',
      authData,
    });
  });
});

app.post('/api/login', (_req, res) => {
  // Mock user
  const user: User = {
    _id: 1,
    username: 'Zekumoru',
    email: 'dev@zekumoru.com',
  };

  jwt.sign({ user }, 'secret key', { expiresIn: '30s' }, (err: Error | null, token: string | undefined) => {
    res.json({ token });
  });
});

declare global {
  namespace Express {
    interface Request {
      token: string;
    }
  }
}

// Verify token
function verifyToken(req: Request, res: Response, next: NextFunction) {
  // Get auth header value
  // FORMAT OF TOKEN
  // Authorization: Bearer <access_token>
  const bearerHeader = req.headers['authorization'];

  // Check if bearer is undefined
  if (bearerHeader !== undefined) {
    // Split space to get access_token
    const bearer = bearerHeader.split(' ');
    // Get access_token from array
    const bearerToken = bearer[1];

    // Set the token
    req.token = bearerToken;

    // Next middleware
    return next();
  }

  // Forbidden
  res.status(403).json({ error: 403, message: '403 Forbidden' })
}

app.listen(port, hostname, () => {
  console.log(`Server has started running on http://${hostname}:${port}/`);
});