import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Pomodoro Timer Component
const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert('Time is up! Take a break.');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Card sx={{ mt: 4 }}>
      <CardContent>
        <Typography variant="h6">Pomodoro Timer</Typography>
        <Typography variant="h4" sx={{ my: 2 }}>
          {formatTime(timeLeft)}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setTimeLeft(1500)}
          sx={{ ml: 2 }}
        >
          Reset
        </Button>
      </CardContent>
    </Card>
  );
};

// Task Manager Component for Task Prioritization
const TaskManager = () => {
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (taskInput.trim() !== '') {
      setTasks((prev) => [...prev, taskInput.trim()]);
      setTaskInput('');
    }
  };

  const deleteTask = (index) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
      <Typography variant="h6">Task Prioritization</Typography>
      <Box sx={{ display: 'flex', mt: 1 }}>
        <TextField
          fullWidth
          placeholder="Enter a task..."
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={addTask}
          sx={{ ml: 1 }}
        >
          Add
        </Button>
      </Box>
      <List>
        {tasks.map((task, index) => (
          <React.Fragment key={index}>
            <ListItem
              secondaryAction={
                <Button color="error" onClick={() => deleteTask(index)}>
                  Delete
                </Button>
              }
            >
              <ListItemText primary={task} />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

function App() {
  // Dark mode state and theme toggle
  const [mode, setMode] = useState('light');
  const theme = createTheme({
    palette: {
      mode: mode,
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // State for user input and API response
  const [userInput, setUserInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const analyzeText = async () => {
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput })
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || 'Error analyzing text.');
        return;
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError('Error connecting to the server.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Therapy Chatbot
          </Typography>
          <IconButton color="inherit" onClick={toggleTheme}>
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Chat Interface */}
        <Box sx={{ my: 3 }}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            placeholder="Talk about your stress, workload, or emotional state..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button variant="contained" color="primary" onClick={analyzeText}>
            Analyze
          </Button>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        {analysis && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h5">Analysis Results</Typography>
              <Typography variant="body1">
                <strong>Input Text:</strong> {analysis.input_text}
              </Typography>
              <Typography variant="body1">
                <strong>Compound Score:</strong> {analysis.compound_score}
              </Typography>
              <Typography variant="body1">
                <strong>Stress Level:</strong> {analysis.stress_level}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                <strong>Remedy Suggestions:</strong>
              </Typography>
              <List>
                {analysis.remedies.map((tip, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Pomodoro Timer */}
        <PomodoroTimer />

        {/* Task Manager */}
        <TaskManager />
      </Container>
    </ThemeProvider>
  );
}

export default App;
