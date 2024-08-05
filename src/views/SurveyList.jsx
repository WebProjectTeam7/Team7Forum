import { useEffect, useState, useContext } from 'react';
import { getAllSurveys } from '../services/survey.service';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../state/app.context';
import './CSS/SurveyList.css';

export default function SurveyList() {
    const [surveys, setSurveys] = useState([]);
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        getAllSurveys().then(setSurveys);
    }, []);

    const isAdminOrModerator = userData && (userData.role === 'admin' || userData.role === 'moderator');

    return (
        <div className="survey-list-container">
            <h1 className="survey-list-title">Available Surveys</h1>
            {isAdminOrModerator && (
                <button className="add-survey-button" onClick={() => navigate('/add-survey')}>Add Survey</button>
            )}
            {surveys.map((survey) => (
                <div className="survey-item" key={survey.id}>
                    <Link className="survey-link" to={`/survey/${survey.id}`}>{survey.title}</Link>
                </div>
            ))}
        </div>
    );
}