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
    id: string;
    name: string;
    balances: Balances;
    }

interface Order {
    id: string;
    price: string;
    userId: string;
    quantity: number;
    stock: string;
    time: Date;
    }

export const stock = ["AAPL", "GOOGL", "TSLA", "AMZN", "MSFT"];

const bids: Order[] = []
const offer: Order[] = []


const initializeStockBalances = (): { [key: string]: number } => {
    const stockBalances: { [key: string]: number } = {};
    stock.forEach((stock) => {
        stockBalances[stock] = 0;
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
    const { side, id, price, userId, quantity } = req.body;
    const { stock } = req.body;

    const remainingQty = fillOrder( stock, quantity, price, userId, new Date());

    if (remainingQty === 0) {
        res.json({filledQuantity: quantity})
    }

    if(side == "bid"){
        bids.push({
            id,
            price,
            userId,
            quantity: remainingQty,
            stock,
            time: new Date(),
        });
        bids.sort((a, b) => a.price < b.price ? -1 : a.price > b.price ? 1 : 0);
    }   else {
            offer.push({
                id,
                price,
                userId,
                quantity:remainingQty,
                stock,
                time: new Date(),
            });
            offer.sort((a, b) => a.price < b.price ? 1 : a.price > b.price ? -1 : 0);
        }

        res.json({
            filledQuantity: quantity - remainingQty,
    });
})

app.get("/orderbook", (req: any, res: any) => {
    // Represents a depth dict with price as key and  and the values associated with those keys
    // are dictionaries containing the order type and quantity information.
    const depth: {
        [price : string]: {
            type: "bid" | "offer",
            quantity: number,
    }
} = {};

for(let i = 0; i < bids.length; i++){
    if(!depth[bids[i].price]){
        depth[bids[i].price] = {
            type: "bid",
            quantity: bids[i].quantity,
        };
    }else {
        depth[bids[i].price].quantity += bids[i].quantity;
    }
}
for (let i = 0; i < offer.length; i++) {
    if (!depth[offer[i].price]) {
      depth[offer[i].price] = {
        type: "offer",
        quantity: offer[i].quantity,
      };
    } else {
      depth[offer[i].price].quantity += offer[i].quantity;
    }
  }

  res.json({ depth });
  
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