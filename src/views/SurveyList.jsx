import { useEffect, useState, useContext } from 'react';
import { getAllSurveys, deleteSurvey } from '../services/survey.service';
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

    const handleRemoveSurvey = async (surveyId) => {
        if (window.confirm('Are you sure you want to delete this survey?')) {
            try {
                await deleteSurvey(surveyId);
                setSurveys(surveys.filter(survey => survey.id !== surveyId));
                alert('Survey removed successfully.');
            } catch (error) {
                console.error('Error removing survey:', error);
                alert('Failed to remove survey. Please try again.');
            }
        }
    };

    return (
        <div className="survey-list-container">
            <h1 className="survey-list-title">Available Surveys</h1>
            {isAdminOrModerator && (
                <button className="add-survey-button" onClick={() => navigate('/add-survey')}>
                    <svg className="w-5 fill-white" viewBox="0 0 15 15">
                        <svg
                            className="w-6 h-6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            ></path>
                        </svg>
                    </svg>
                Add Survey
                </button>
            )}
            {surveys.map((survey) => (
                <div className="survey-item" key={survey.id}>
                    <Link className="survey-link" to={`/survey/${survey.id}`}>{survey.title}</Link>
                    {isAdminOrModerator && (
                        <button
                            className="remove-button"
                            onClick={() => handleRemoveSurvey(survey.id)}
                        >
                            <svg viewBox="0 0 448 512" className="svgIcon">
                                <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path>
                            </svg>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}