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
        headline: "",
        about: "",
        location: "",
        experience: [
            {
                company: "",
                role: "",
                startDate: "",
                endDate: "",
                description: "",
                _id: ""
            }
        ],
        education: [
            {
                school: "",
                degree: "",
                fieldOfStudy: "",
                startDate: "",
                endDate: "",
                _id: ""
            }
        ],
        skills: [],
        connections: [],
        jobs: [],
        posts: [],
        comments: [],
        following: [],
        followers: [],
        isAdmin: false,
        createdAt: "",
        updatedAt: "",
        __v: 0,
        applications: []
    }
];

export const initialPostsData = [
    {
        _id: "",
        content: "",
        image: "",
        likes: [],
        comments: [],
        creator: {
            _id: "",
            email: "",
            password: "",
            name: "",
            posts: [
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
    post: {},
    text: "",
    likes: [],
    creator: "",
    createdAt: "",
    updatedAt: "",
    __v: 0
}

export const initialJobsData = [
    {
        title: "",
        company: "",
        location: "",
        description: "",
        requirements: [],
        creator: [],
        applicants: [],
        _id: "",
        createdAt: "",
        updatedAt: "",
        __v: 0
    }];

export const initialApplicationsData = [
    {
        _id: "",
        job: {
            _id: "",
            title: "",
            company: "",
            location: "",
            description: "",
            requirements: [],
            creator: "",
            applicants: [],
            createdAt: "",
            updatedAt: "",
            __v: 0
        },
        applicant: "",
        resume: "",
        coverLetter: "",
        status: "",
        createdAt: "",
        updatedAt: "",
        __v: 0
    }
];

export const initialConversationsData = [
    {
        _id: "",
        participants: [],
        messages: [],
        createdAt: "",
        updatedAt: "",
        __v: 0,
        lastMessage: {
            _id: "",
            conversation: "",
            sender: {
                _id: "",
                email: "",
                password: "",
                name: "",
                image: "",
                connections: [],
                following: [],
                followers: [],
                conversations: [],
                isAdmin: false,
                createdAt: "",
                updatedAt: "",
                __v: 0,
            },
            text: "",
            read: false,
            createdAt: "",
            updatedAt: "",
            __v: 0
        }
    }
];

export const initialConnectionsData = [
    {
        _id: "",
        sender: {
            _id: "",
            email: "",
            name: "",
            image: "",
            connections: [],
            jobs: [],
            posts: [],
            comments: [],
            following: [],
            followers: [],
            conversations: [],
            isAdmin: false,
            createdAt: "",
            updatedAt: "",
            applications: [],
            education: [],
            experience: [],
            skills: [],
            about: "",
            headline: "",
            location: ""
        },
        receiver: {
            _id: "",
            email: "",
            name: "",
            image: "",
            headline: "",
            about: "",
            location: "",
            experience: [
                {
                    company: "",
                    role: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                    _id: ""
                }
            ],
            education: [
                {
                    school: "",
                    degree: "",
                    fieldOfStudy: "",
                    startDate: "",
                    endDate: "",
                    _id: ""
                }
            ],
            skills: [],
            connections: [],
            jobs: [],
            posts: [],
            comments: [],
            following: [],
            followers: [],
            conversations: [],
            isAdmin: false,
            createdAt: "",
            updatedAt: "",
            applications: []
        },
        status: "",
        createdAt: "",
        updatedAt: ""
    }
];
