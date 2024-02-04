import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

interface Balances {
    amount: number;
    stock: {[key: string]: number};
}

interface User {
    id: String;
    name: string;
    balances: Balances;
    }

interface Order {
    id: String;
    amount: string;
    userId: number;
    quantity: number;
    stock: string;
    time: Date;
    }

export const stock = ["AAPL", "GOOGL", "TSLA", "AMZN", "MSFT"];

const bids: Order[] = []
const offer: Order[] = []


const initializeStockBalances = (): { [key: string]: number } => {
    const stockBalances: { [key: string]: number } = {};
    stock.forEach((stockName) => {
        stockBalances[stockName] = 0;
    });
    return stockBalances;
};


// fixes needed prices and userid balance

const users: User[] = [

    {
        id: "1",
        name: "John Doe",
        balances: { 
            amount: 10000,
            stock: initializeStockBalances(),
    },
    }, 
    {
        id: "2",
        name: "John Hoe",
        balances: { 
            amount: 10000,
            stock: initializeStockBalances(),
         },
        },
];

const updateBalances = (userId: string, stock: string, quantity: number): void => {
    const user = users.find((u) => u.id === userId);
    if (user) {
        // Update stock balances
        user.balances.stock[stock] += quantity;

        // Update amount based on transaction
        const stockPrice = 10; // Replace with logic to get the stock price based on the stock name
        user.balances.amount -= quantity * stockPrice;
    }
};


// Placing a limit order 
// Body should contain info about the order including name of stock, quantity, price, and user id
app.post("/order", (req, res) => {
    // Need to add cookies/jwt and all that jazz
    const { side, id, price, userId, quantity, stock } = req.body;

    const remainingQty = fillOrder(side, stock, quantity, price, userId);

    if (remainingQty === 0) {
        res.json({filledQuantity: quantity})
    }

    if(side == "bid"){
        bids.push({
            id,
            price: number,
            userId,
            quantity:remainingQty,
            stock
        });
        bids.sort((a, b) => a.price < b.price ? -1 : a.price > b.price ? 1 : 0);
    }   else {
            offer.push({
                id,
                price: number,
                userId,
                quantity:remainingQty,
                stock
            });
            offer.sort((a, b) => a.price < b.price ? 1 : a.price > b.price ? -1 : 0);
        }

        res.json({
            filledQuantity: quantity - remainingQty,
    });
})

app.get("/orderbook", (req, res) => {
    //Need to implement this :p
})

function fillOrder(stock: string, quantity: number, price: number, userId: number, time: Date){
    // Need to implement this
    return 0;
}

app.get("/balance/:userId", (req, res) => {
    const userId = req.params.userId;
    const user = users.find(x => x.id === userId);
    if (!user) {
      return res.json({
        USD: 0,
        stock: 0
      })
    }
    res.json({ balances: user.balances });
  })
  

app.listen(3000, () => {
  console.log('🚀 Server is running on port 3000');
});