exports.handleChange = (e, setState) => {
    const {name, value} = e.target;
    setState(prevState => ({
        ...prevState,
        [name]: value
    }));
}