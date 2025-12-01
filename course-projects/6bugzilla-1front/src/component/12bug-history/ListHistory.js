import React, { useContext, useEffect, useState } from 'react';
import { BugsContext } from "../../contexts/bugs.context";
import { useFetchBugs } from "../../rest/useRestBugs";
import {Container, Table} from "reactstrap";

function ListHistory(props) {
    const bugs = useContext(BugsContext);
    const fetchBugs = useFetchBugs();
    const { bugId } = props.match.params;
    const [bug, setBug] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getBugs = async () => {
            try {
                const bugs = await fetchBugs();
                const filteredBug = bugs.filter(b => b._id === bugId);
                setBug(filteredBug[0]);
                setError(null);
            } catch (error) {
                setError('Bugs could not be retrieved.');
            }
        };

        getBugs();
    }, [bugId]);

    if (!bug) {
        return <div>Loading...</div>;
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="container container-fluid p-5 my-4 mx-auto bg-light border-3 border rounded">
            <h2>Bug History</h2>
            <Table>
                <thead>
                <tr>
                    <th>Who</th>
                    <th>When</th>
                    <th>What</th>
                    <th>Details</th>
                </tr>
                </thead>
                <tbody>
                {bug.history.map(entry => (
                    <tr key={entry._id}>
                        <td>{entry.changedBy}</td>
                        <td>{formatDate(entry.changedAt)}</td>
                        <td>{entry.fields.join(', ')}</td>
                        <td>
                            {entry.fields.map((field, index) => (
                                <div key={index}>
                                    <strong>{field}:</strong>
                                    {Array.isArray(entry.oldValues[index]) ? (
                                        <span><span className="text-muted"> Removed:</span> {entry.oldValues[index].join(', ')} </span>
                                    ) : (
                                        <span> {entry.oldValues[index]} </span>
                                    )}
                                    {Array.isArray(entry.newValues[index]) ? (
                                        <span><span className="text-muted"> Added:</span> {entry.newValues[index].join(', ')} </span>
                                    ) : (
                                        <span><span className="text-muted"> to</span> {entry.newValues[index]} </span>
                                    )}
                                </div>
                            ))}
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
}

export default ListHistory;