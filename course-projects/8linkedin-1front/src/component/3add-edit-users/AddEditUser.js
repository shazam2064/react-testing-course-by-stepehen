import React, {useState, useEffect, useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {AdminUsersContext, DispatchContext} from "../../contexts/admin-users.context";
import {
    useCreateAdminUser,
    useFetchAdminUserById,
    useUpdateAdminUser
} from '../../rest/useRestAdminUsers';
import {UserContext} from '../../contexts/user.context';
import {getInitialAdminUserState} from "../../reducers/admin-user.reducer";
import {Alert, Card, Col, Form, FormGroup, FormText, Input, Label, Row} from "reactstrap";
import {API_URL} from "../../rest/api.rest";

function AddEditUser(props) {
    const {triggerReload} = useContext(AdminUsersContext);
    const dispatch = useContext(DispatchContext);
    const [adminUser, setAdminUser] = useState({
        ...getInitialAdminUserState()[0],
        imageUrl: 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png'
    });
    const [error, setError] = useState(null);
    const createAdminUser = useCreateAdminUser();
    const updateAdminUser = useUpdateAdminUser();
    const fetchAdminUserById = useFetchAdminUserById();
    const {adminUserId} = props.match.params;
    const isEditMode = !!adminUserId;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const isCreator = adminUser._id === loggedUser.userId;
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            fetchAdminUserById(adminUserId).then(adminUser => {
                setAdminUser({
                    ...adminUser,
                    imageUrl: adminUser.image ? `${API_URL}/${adminUser.image}` : 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png'
                });
                console.log('user: ' + adminUser);
            }).catch(error => {
                setError(`User could not be fetched: ${error.message}`);
            });
        } else {
            setAdminUser({
                ...getInitialAdminUserState()[0],
                imageUrl: 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png'
            });
        }
    }, [adminUserId, isEditMode]);

    const handleChange = (e) => {
        const {name, value, type, checked, files} = e.target;
        if (name === 'image' && files.length > 0) {
            const file = files[0];
            setAdminUser(prevState => ({
                ...prevState,
                imageFile: file,
                imageUrl: URL.createObjectURL(file) // For preview purposes
            }));
        } else {
            setAdminUser(prevState => ({
                ...prevState,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    }

    const handleExperienceChange = (e, index, field) => {
        const updatedExperience = [...adminUser.experience];
        updatedExperience[index][field] = e.target.value;
        setAdminUser({ ...adminUser, experience: updatedExperience });
    };

    const addExperience = () => {
        setAdminUser({
            ...adminUser,
            experience: [...adminUser.experience, {company: '', role: '', startDate: '', endDate: '', description: ''}]
        });
    };

    const handleRemoveExperience = (index) => {
        const updatedExperience = adminUser.experience.filter((_, i) => i !== index);
        setAdminUser({ ...adminUser, experience: updatedExperience });
    };

    const handleEducationChange = (e, index, field) => {
        const updatedEducation = [...adminUser.education];
        updatedEducation[index][field] = e.target.value;
        setAdminUser({...adminUser, education: updatedEducation});
    };

    const addEducation = () => {
        setAdminUser({
            ...adminUser,
            education: [...adminUser.education, {school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: ''}]
        });
    };

    const handleRemoveEducation = (index) => {
        const updatedEducation = adminUser.education.filter((_, i) => i !== index);
        setAdminUser({ ...adminUser, education: updatedEducation });
    };

    const addSkill = (e) => {
        e.preventDefault();
        if (adminUser.newSkill) {
            setAdminUser({
                ...adminUser,
                skills: [...adminUser.skills, adminUser.newSkill],
                newSkill: ''
            });
        }
    };

    const removeSkill = (index) => {
        const updatedSkills = adminUser.skills.filter((_, i) => i !== index);
        setAdminUser({...adminUser, skills: updatedSkills});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        try {
            let savedUser;
            if (isEditMode) {
                await updateAdminUser(adminUser);
                savedUser = adminUser;
            } else {
                savedUser = await createAdminUser(adminUser);
            }
            if (loggedUser.userId === adminUser._id) {
                triggerReload();
                console.log('trigger from the handle submit');
            }
            setError(null);
            props.history.push(`/profile/${isEditMode ? adminUserId : savedUser._id}`);
        } catch (error) {
            setError(`User could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    };

    if (!isAdmin) {
        if (!isCreator) {
            return <div className="container p-s5 my-4 col-8 mx-auto">
                <Alert color="warning">
                    <h4 className="alert-heading">
                        Unauthorized!
                    </h4>
                    <p>
                        Hey, you are not authorized to view this page.
                    </p>
                    <hr/>
                    <p className="mb-0">
                        Go <a
                        className="alert-link"
                        onClick={() => props.history.push('/')}>
                        back
                    </a>.
                    </p>
                </Alert>
            </div>;
        }
    }

    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return (
        <section className="container mx-auto bg-transparent">
            {error ?
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <Form onSubmit={handleSubmit} method="Post">
                <Card className="p-4 mx-auto mb-3">
                    <Col>
                        <h1 className="mb-4 display-5 bg-white text-secondary text-decoration-underline">{isEditMode ? 'Edit User' : 'Add User'}</h1>
                        <Row>
                            <Col xs="1">
                                <img
                                    src={adminUser.imageUrl}
                                    alt="Profile Picture"
                                    style={{
                                        width: '90px',
                                        height: '90px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Col>
                            <Col xs="11">
                                <FormGroup>
                                    <Label for="image">Profile Picture</Label>
                                    <Input
                                        type="file"
                                        id="image"
                                        name="image"
                                        onChange={handleChange}
                                    />
                                    {isEditMode && adminUser.image && (
                                        <input
                                            type="hidden"
                                            name="existingImage"
                                            value={adminUser.image}
                                        />
                                    )}
                                    <FormText>
                                        If no profile picture is uploaded, a default image will be used.
                                    </FormText>
                                </FormGroup>
                            </Col>
                        </Row>
                    </Col>
                    <FormGroup>
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-control"
                            onChange={handleChange}
                            value={adminUser.name}
                            required={!isEditMode}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            onChange={handleChange}
                            value={adminUser.email}
                            required={!isEditMode}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-control"
                            onChange={handleChange}
                            value={adminUser.password}

                        />
                    </FormGroup>
                    {isAdmin && (
                        <FormGroup className="custom-control custom-checkbox d-flex justify-content-center">
                            <input
                                type="checkbox"
                                id="isAdmin"
                                name="isAdmin"
                                className="custom-control-input"
                                onChange={handleChange}
                                checked={adminUser.isAdmin}
                            />
                            <label className="custom-control-label" htmlFor="isAdmin">Admin</label>
                        </FormGroup>
                    )}
                </Card>
                <Card className="p-4 mx-auto mb-3">
                    <FormGroup>
                        <label htmlFor="about">About</label>
                        <textarea
                            id="about"
                            name="about"
                            className="form-control"
                            onChange={handleChange}
                            value={adminUser.about}
                            rows="3"
                        />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="headline">Headline</label>
                        <input
                            type="text"
                            id="headline"
                            name="headline"
                            className="form-control"
                            onChange={handleChange}
                            value={adminUser.headline}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            className="form-control"
                            onChange={handleChange}
                            value={adminUser.location}
                        />
                    </FormGroup>
                </Card>
                <Card className="p-4 mx-auto mb-3">
                    {/* Experience Accordion */}
                    <FormGroup>
                        <Label className="text-body-emphasis me-3">Experience</Label>
                        {adminUser.experience.map((exp, index) => (
                            <div key={index} className="mb-4">
                                <div className="d-flex flex-column gap-3">
                                    <Input
                                        type="text"
                                        id="company"
                                        name="company"
                                        placeholder="Company"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(e, index, 'company')}
                                    />
                                    <Input
                                        type="text"
                                        id="role"
                                        name="role"
                                        placeholder="Role"
                                        value={exp.role}
                                        onChange={(e) => handleExperienceChange(e, index, 'role')}
                                    />
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        value={formatDate(exp.startDate)}
                                        onChange={(e) => handleExperienceChange(e, index, 'startDate')}
                                        type="date"
                                    />
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        value={formatDate(exp.endDate)}
                                        onChange={(e) => handleExperienceChange(e, index, 'endDate')}
                                        type="date"
                                    />
                                    <Input
                                        type="text"
                                        id="description"
                                        name="description"
                                        placeholder="Description"
                                        value={exp.description}
                                        onChange={(e) => handleExperienceChange(e, index, 'description')}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-outline"
                                        onClick={() => handleRemoveExperience(index)}
                                    >
                                        Remove Experience
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-outline-primary mx"
                            onClick={addExperience}
                        >
                            + Add Experience
                        </button>
                    </FormGroup>
                </Card>
                <Card className="p-4 mx-auto mb-3">
                    {/* Education Accordion */}
                    <FormGroup>
                        <Label className="text-body-emphasis me-3">Education</Label>
                        {adminUser.education.map((edu, index) => (
                            <div key={index} className="mb-4">
                                <div className="d-flex flex-column gap-3">
                                    <Input
                                        type="text"
                                        id="school"
                                        name="school"
                                        placeholder="School"
                                        value={edu.school}
                                        onChange={(e) => handleEducationChange(e, index, 'school')}
                                    />
                                    <Input
                                        type="text"
                                        id="degree"
                                        name="degree"
                                        placeholder="Degree"
                                        value={edu.degree}
                                        onChange={(e) => handleEducationChange(e, index, 'degree')}
                                    />
                                    <Input
                                        type="text"
                                        id="fieldOfStudy"
                                        name="fieldOfStudy"
                                        placeholder="Field of Study"
                                        value={edu.fieldOfStudy}
                                        onChange={(e) => handleEducationChange(e, index, 'fieldOfStudy')}
                                    />
                                    <Input
                                        id="startDate"
                                        name="startDate"
                                        value={formatDate(edu.startDate)}
                                        onChange={(e) => handleEducationChange(e, index, 'startDate')}
                                        type="date"
                                    />
                                    <Input
                                        id="endDate"
                                        name="endDate"
                                        value={formatDate(edu.endDate)}
                                        onChange={(e) => handleEducationChange(e, index, 'endDate')}
                                        type="date"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-outline"
                                        onClick={() => handleRemoveEducation(index)}
                                    >
                                        Remove Education
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={addEducation}
                        >
                            + Add Education
                        </button>
                    </FormGroup>
                </Card>
                <Card className="p-4 mx-auto mb-3">
                    {/* Skills Tags */}
                    <FormGroup>
                        <Label>Skills</Label>
                        <div className="d-flex flex-wrap">
                            {adminUser.skills.map((skill, index) => (
                                <span key={index}
                                      className="d-flex text-info align-items-center border border-info rounded mx-1 py-0 px-1 mb-2">
                    {skill}
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0 mx-1"
                                        onClick={() => removeSkill(index)}
                                    >
                        x
                    </button>
                </span>
                            ))}
                        </div>
                        <Input
                            type="text"
                            placeholder="Add a skill"
                            value={adminUser.newSkill || ''}
                            onChange={(e) => setAdminUser({...adminUser, newSkill: e.target.value})}
                            onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                        />
                    </FormGroup>
                </Card>
                <div className="d-flex align-items-center justify-content-center">
                    <button className="btn btn-secondary text-light mb-3">
                        {isEditMode ? 'Update User' : 'Add User'}
                    </button>
                </div>
            </Form>
        </section>
    );
}

export default withRouter(AddEditUser);