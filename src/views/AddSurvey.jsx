import { useContext, useState } from 'react';
import { AppContext } from '../state/app.context';
import { addSurvey } from '../services/survey.service';
import { useNavigate } from 'react-router-dom';

export default function AddSurvey() {
    const { userData } = useContext(AppContext);
    const [survey, setSurvey] = useState({
        title: '',
        description: '',
        choices: [],
    });
    const [choice, setChoice] = useState({ text: '', image: null });
    const navigate = useNavigate();

    if (userData?.role !== 'admin' && userData?.role !== 'moderator') {
        return <div>You are not authorized to add a survey.</div>;
    }

    const addChoice = () => {
        if (choice.text && choice.image) {
            setSurvey((prev) => ({
                ...prev,
                choices: [...prev.choices, { id: Date.now(), ...choice }],
            }));
            setChoice({ text: '', image: null });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setChoice((prev) => ({ ...prev, image: file }));
        }
    };

    const handleSubmit = async () => {
        await addSurvey(survey);
        navigate('/surveys');
    };

    return (
        <div>
            <h1>Add Survey</h1>
            <label>
                Title:
                <input
                    type="text"
                    value={survey.title}
                    onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                />
            </label>
            <br />
            <label>
                Description:
                <textarea
                    value={survey.description}
                    onChange={(e) =>
                        setSurvey({ ...survey, description: e.target.value })
                    }
                />
            </label>
            <br />
            <label>
                New Choice:
                <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => setChoice({ ...choice, text: e.target.value })}
                />
                <input type="file" onChange={handleImageChange} />
            </label>
            <button onClick={addChoice}>Add Choice</button>
            <br />
            <button onClick={handleSubmit}>Create Survey</button>
            <div>
                <h2>Choices:</h2>
                {survey.choices.map((c) => (
                    <p key={c.id}>{c.text}</p>
                ))}
            </div>
        </div>
    );
}
