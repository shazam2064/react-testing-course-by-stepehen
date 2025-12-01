import React, { useContext, useEffect, useState } from 'react';
import { ComponentsContext, DispatchContext as ComponentsDispatch } from "../../contexts/components.context";
import { BugsContext, DispatchContext as BugsDispatch } from "../../contexts/bugs.context";
import { useFetchComponents } from "../../rest/useRestComponent";
import { useFetchBugs } from "../../rest/useRestBugs";
import { TitleContext } from "../../contexts/title.context";
import BugItem from "../15search-bugs/BugItem";
import {ProductsContext} from "../../contexts/products.context";
import {getInitialBugState} from "../../reducers/bug.reducer";
import {Alert, Table} from "reactstrap";

function BrowseBug(props) {
    const components = useContext(ComponentsContext);
    const products = useContext(ProductsContext);
    const bugs = useContext(BugsContext);
    const [filteredBugs, setFilteredBugs] = useState(getInitialBugState());
    const componentsDispatch = useContext(ComponentsDispatch);
    const bugsDispatch = useContext(BugsDispatch);
    const [error, setError] = useState('');
    const fetchComponents = useFetchComponents();
    const fetchBugs = useFetchBugs();
    const { setTitle } = useContext(TitleContext);
    const componentId = props.match.params.componentId;

    useEffect(() => {
        fetchComponents().then(components => {
            componentsDispatch({ type: 'SET_COMPONENTS', components: components });
        }).catch(error => {
            componentsDispatch({ type: 'SET_COMPONENTS', components: [] });
            setError(error.message);
        });

        fetchBugs().then(bugs => {
            bugsDispatch({ type: 'SET_BUGS', bugs: bugs });
            const filteredBugs = bugs.filter(bug => bug.component._id === componentId);
            setFilteredBugs(filteredBugs);
        }).catch(error => {
            bugsDispatch({ type: 'SET_BUGS', bugs: [] });
            setError(error.message);
        });

        setTitle('Browse Bugs');
    }, [setTitle]);

    const selectedComponent = components.find(component => component._id === componentId);
    const selectedProduct = selectedComponent.product;

    return (
        <div className="container p-5 my-4 mx-auto bg-light border-3 border rounded">
            {error ? (
                <Alert className="custom-alert">
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : selectedComponent && selectedProduct ? (
                <div>
                    <h2><span className="text-muted">Component: </span> {selectedComponent.name} <span className="text-muted"> - Product: </span>{selectedProduct.name}</h2>
                    <Table>
                        <thead>
                        <tr>
                            <th>Product</th>
                            <th>Comp</th>
                            <th>Assignee</th>
                            <th>Status</th>
                            <th>Resolution</th>
                            <th>Summary</th>
                            <th>Changed</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredBugs.length > 0 ? (
                            filteredBugs.map(bug => (
                                <BugItem key={bug._id} bug={bug} props={props}/>
                            ))
                        ) : (
                            <p>No bugs found for this component.</p>
                        )}
                        </tbody>
                    </Table>
                </div>
                ) : (
                <p>Component or Product not found</p>
                )}
        </div>
    );
}

export default BrowseBug;