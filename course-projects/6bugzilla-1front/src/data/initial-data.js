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
        bugsAssigned: [
            {
                _id: "",
                product: "",
                component: "",
                summary: "",
                description: "",
                severity: "",
                priority: "",
                version: 0,
                hardware: "",
                os: "",
                status: "",
                resolution: "",
                cc: [
                    ""
                ],
                assignee: "",
                reporter: "",
                deadline: "",
                hoursWorked: 0,
                hoursLeft: 0,
                dependencies: [],
                attachment: "",
                comments: [],
                history: [],
                createdAt: "",
                updatedAt: "",
                __v: 0
            }
        ],
        reportedBugs: [
            {
                _id: "",
                product: "",
                component: "",
                summary: "",
                description: "",
                severity: "",
                priority: "",
                version: 0,
                hardware: "",
                os: "",
                status: "",
                resolution: "",
                cc: [
                    ""
                ],
                assignee: "",
                reporter: "",
                deadline: "",
                hoursWorked: 0,
                hoursLeft: 0,
                dependencies: [],
                attachment: "",
                comments: [],
                history: [],
                createdAt: "",
                updatedAt: "",
                __v: 0
            }
        ],
        isAdmin: false,
        createdAt: "",
        updatedAt: "",
        __v: 2
    }
];

export const classificationsInitialData = [
    {
        _id: "",
        name: "",
        description: "",
        products: [
            {
                _id: "",
                classification: "",
                name: "",
                description: "",
                version: 0,
                components: [
                    ""
                ],
                createdAt: "",
                updatedAt: ""
            }
        ],
        createdAt: "",
        updatedAt: "",
        __v: 0
    }
];

export const productsInitialData = [
    {
        _id: "",
        classification: {
            _id: "",
            name: "",
            description: "",
            products: [],
            createdAt: "",
            updatedAt: "",
        },
        name: "",
        description: "",
        version: 0,
        components: [
            {
                _id: "",
                product: "",
                name: "",
                description: "",
                assignee: "",
                CC: [
                    ""
                ],
                bugs: [
                    ""
                ],
                createdAt: "",
                updatedAt: ""
            }
        ],
        createdAt: "",
        updatedAt: "",
    }
];

export const componentsInitialData = [{
        _id: "",
        product: {
            _id: "",
            classification: "",
            name: "",
            description: "",
            version: 0,
            components: [""],
            createdAt: "",
            updatedAt: "",
            __v: 0
        },
        name: "",
        description: "",
        assignee: {
            _id: "",
            email: "",
            password: "",
            name: "",
            bugsAssigned: [""],
            reportedBugs: [""],
            isAdmin: false,
            createdAt: "",
            updatedAt: "",
            __v: 0
        },
        CC: [],
        bugs: [
            {
                _id: "",
                product: "",
                component: "",
                summary: "",
                description: "",
                severity: "",
                priority: "",
                version: 0,
                hardware: "",
                os: "",
                status: "",
                resolution: "",
                cc: [""],
                assignee: "",
                reporter: "",
                deadline: "",
                hoursWorked: 0,
                hoursLeft: 0,
                dependencies: [],
                attachment: "",
                comments: [""],
                history: [""],
                createdAt: "",
                updatedAt: "",
                __v: 0
            }
        ],
        createdAt: "",
        updatedAt: "",
        __v: 0
}];

export const bugsInitialData = [{
    _id: "",
    product: {
        _id: "",
        classification: "",
        name: "",
        description: "",
        version: 0,
        components: [""],
        createdAt: "",
        updatedAt: "",
        __v: 0
    },
    component: {
        _id: "",
        product: "",
        name: "",
        description: "",
        assignee: "",
        CC: [""],
        bugs: [""],
        createdAt: "",
        updatedAt: "",
        __v: 0
    },
    summary: "",
    description: "",
    severity: "",
    priority: "",
    version: 0,
    hardware: "",
    os: "",
    status: "",
    resolution: "",
    CC: [],
    assignee: {
        _id: "",
        email: "",
        password: "",
        name: "",
        bugsAssigned: [""],
        reportedBugs: [""],
        isAdmin: false,
        createdAt: "",
        updatedAt: "",
        __v: 0
    },
    reporter: {
        _id: "",
        email: "",
        password: "",
        name: "",
        bugsAssigned: [""],
        reportedBugs: [""],
        isAdmin: false,
        createdAt: "",
        updatedAt: "",
        __v: 0
    },
    deadline: "",
    hoursWorked: 0,
    hoursLeft: 0,
    dependencies: [],
    attachment: "",
    comments: [],
    history: [],
    createdAt: "",
    updatedAt: "",
    __v: 0
}];

export const commentsInitialData = {
    _id: "",
    bug: "",
    text: "",
    creator: "",
    createdAt: "",
    updatedAt: "",
}