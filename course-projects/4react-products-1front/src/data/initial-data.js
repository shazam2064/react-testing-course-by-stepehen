export const imageUrl = "https://pngimg.com/d/book_PNG2114.png";

const prod1 = {_id: "8d6793da-8473-41b8-aa29-9ef49caa2886", name: "Book 3", imageUrl, description: "a not nice book", price: 55.55, image: null};
const prod2 = {_id: "4fb46d13-86cc-400d-8625-8be000f52f8b", name: "Book 4", imageUrl, description: "another nice book", price: 44.44, image: null};

export const prodInitialData = [
    prod1,
    prod2
];

export const cartInitialData = {
    _id: "66f284474f77a7a9958430a0",
    user: "66e9455da6a4b502be02cfcc",
    products: [
        {
            product: prod1,
            quantity: 1,
            _id: "6703a7e7bfb5722d48245a37"
        }
    ],
    createdAt: "2024-09-24T09:20:07.854Z",
    updatedAt: "2024-10-07T09:20:39.261Z",
    __v: 4
};

export const orderInitialData = [
    {
        orderId: "72a36bd4-84ab-4106-8b01-5aa033fe70ab",
        orderList: [
            {
                productItem: prod1,
                quantity: 2
            },
            {
                productItem: prod2,
                quantity: 1
            }
        ]
    }
];

export const userInitialData = {
    userId: "",
    email: "",
    token: "",
    updatedAt: "",
    isLogged: false,
};

export const adminUsersInitialData = [
    {
        _id: "",
        email: "",
        password: "",
        name: "",
        status: "",
        isAdmin: false,
    },
];