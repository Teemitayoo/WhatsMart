import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRouter from '../src/modules/auth/auth.router';
import categoryRouter from '../src/modules/category/category.router';
import productRouter from '../src/modules/product/product.router';
import { ErrorHandler } from './common/error';
import { Application } from 'express';

const app: Application = express();

app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/category', categoryRouter);

app.use('*', ErrorHandler.pagenotFound());
app.use(ErrorHandler.handle());
ErrorHandler.exceptionRejectionHandler();

export default app;
