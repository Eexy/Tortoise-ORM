import { firestore } from "firebase-admin";
import OrderByDirection = firestore.OrderByDirection;

export type OrderClause = [string, OrderByDirection]