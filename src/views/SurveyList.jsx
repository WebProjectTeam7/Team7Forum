import { useEffect, useState } from 'react';
import { getAllSurveys } from '../services/survey.service';
import { Link } from 'react-router-dom';

export default function SurveyList() {
    const [surveys, setSurveys] = useState([]);

    useEffect(() => {
        getAllSurveys().then(setSurveys);
    }, []);

    return (
        <div>
            <h1>Available Surveys</h1>
            {surveys.map((survey) => (
                <div key={survey.id}>
                    <Link to={`/survey/${survey.id}`}>{survey.title}</Link>
                </div>
            ))}
        </div>
    );
}
