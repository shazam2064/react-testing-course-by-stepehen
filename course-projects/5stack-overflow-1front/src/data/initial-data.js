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
        questions: [
        {
            _id: "",
            title: "",
            content: "",
            votes: 0,
            views: 0,
            tags: [
                ""
            ],
            answers: [
                {
                    _id: "",
                    content: "",
                    votes: 0,
                    questionId: "",
                    creator: "",
                    voters: [],
                    createdAt: "",
                    updatedAt: "",
                }
            ],
            creator: "",
            voters: [],
            createdAt: "",
            updatedAt: "",
        }
    ],
        answers: [],
        isAdmin: false,
        createdAt: "",
        updatedAt: "",
}
];

export const initialQuestionsData = [
    {
        _id: "",
        title: "",
        content: "",
        votes: 0,
        voters: [],
        views: 0,
        tags: [],
        answers: [],
        creator: "",
        createdAt: "",
        updatedAt: "",
    },
];

export const initialAnswerData = [
    {
        _id: "",
        content: "",
        votes: 0,
        questionId: "",
        creator: "",
        createdAt: "",
        updatedAt: "",
        voters: [
            {
                userId: "",
                vote: "",
                _id: ""
            }
        ]
    }
]

export const initialTagData = [
    {
        "_id": "",
        "name": "",
        "questions": [],
        "description": "",
        "createdAt": "",
        "updatedAt": "",
    }
]