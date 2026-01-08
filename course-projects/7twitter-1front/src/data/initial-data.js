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
        image: "https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png",
        tweets: [],
        comments: [],
        following: [],
        followers: [],
        isAdmin: false,
        createdAt: "",
        updatedAt: "",
    }
];

export const initialTweetsData = [
    {
        _id: "",
        text: "",
        image: "",
        likes: [],
        retweets: [],
        comments: [],
        creator: {
            _id: "",
            email: "",
            password: "",
            name: "",
            tweets: [
                ""
            ],
            comments: [],
            following: [],
            followers: [],
            isAdmin: false,
            createdAt: "",
            updatedAt: "",
            __v: 0
        },
        createdAt: "",
        updatedAt: "",
        __v: 0
    }
];

export const initialCommentsData = {
    _id: "",
    tweet: {},
    text: "",
    likes: [],
    creator: "",
    createdAt: "",
    updatedAt: "",
    __v: 0
}
