import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../state/app.context';
import { getSurvey, updateSurvey } from '../services/survey.service';

export default function EditSurvey() {
    const [survey, setSurvey] = useState(null);
    const { id } = useParams();
    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const surveyData = await getSurvey(id);
                setSurvey(surveyData);
            } catch (error) {
                console.error(error);
            }
        };

        fetchSurvey();
    }, [id]);

    const handleUpdate = async () => {
        if (!survey) return;

        try {
            await updateSurvey(id, survey);
            alert('Survey updated successfully');
            navigate(`/survey/${id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to update survey');
        }
    };

    const handleAddChoice = () => {
        const newChoices = { ...survey.choices };
        const newChoiceId =  Object.keys(newChoices).length;
        newChoices[newChoiceId] = { text: '', ratings: {} };
        setSurvey({ ...survey, choices: newChoices });
    };

    const handleRemoveChoice = (choiceId) => {
        const newChoices = { ...survey.choices };
        delete newChoices[choiceId];
        setSurvey({ ...survey, choices: newChoices });
    };

    if (!survey) return <div>Loading...</div>;

    return (
        <div>
            <h1>Edit Survey</h1>
            <label>
                Title:
                <input
                    type="text"
                    value={survey.title}
                    onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                />
            </label>
            <label>
                Description:
                <textarea
                    value={survey.description}
                    onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                />
            </label>
            {Object.entries(survey.choices).map(([choiceId, choice]) => (
                <div key={choiceId}>
                    <label>
                        Choice {choiceId}:
                        <input
                            type="text"
                            value={choice.text}
                            onChange={(e) => {
                                const newChoices = { ...survey.choices };
                                newChoices[choiceId] = { ...choice, text: e.target.value };
                                setSurvey({ ...survey, choices: newChoices });
                            }}
                        />
                        <button onClick={() => handleRemoveChoice(choiceId)}>Remove</button>
                    </label>
                </div>
            ))}
            <button onClick={handleAddChoice}>Add Choice</button>
            <button onClick={handleUpdate}>Update Survey</button>
        </div>
    );
}
