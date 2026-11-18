
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const FILE = path.join(__dirname, 'courses.json');
function getCourses() {
    const data = fs.readFileSync(FILE, 'utf8');
    return JSON.parse(data);
}
function saveCourses(courses) {
    fs.writeFileSync(FILE, JSON.stringify(courses, null, 2));
}
app.get('/courses', (req, res) => {
    const courses = getCourses();

    res.status(200).json(courses);
});
app.get('/courses/:id', (req, res) => {
    const courses = getCourses();

    const course = courses.find(c => c.id === req.params.id);

    if (!course) {
        return res.status(404).json({
            message: "Course not found"
        });
    }

    res.status(200).json(course);
});
app.post('/courses', (req, res) => {
    const courses = getCourses();

    const newCourse = req.body;

    if (!newCourse.id || !newCourse.courseName ||
        !newCourse.courseCode || !newCourse.department) {
        return res.status(400).json({
            message: "All course details are required"
        });
    }

    const exists = courses.find(c => c.id === newCourse.id);

    if (exists) {
        return res.status(409).json({
            message: "Course ID already exists"
        });
    }

    courses.push(newCourse);
    saveCourses(courses);

    res.status(201).json({
        message: "Course added successfully",
        course: newCourse
    });
});
app.put('/courses/:id', (req, res) => {
    const courses = getCourses();

    const index = courses.findIndex(
        c => c.id === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Course not found"
        });
    }

    courses[index] = {
        ...courses[index],
        ...req.body,
        id: courses[index].id
    };

    saveCourses(courses);

    res.status(200).json({
        message: "Course updated successfully",
        course: courses[index]
    });
});
app.delete('/courses/:id', (req, res) => {
    const courses = getCourses();

    const index = courses.findIndex(
        c => c.id === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Course not found"
        });
    }

    const deletedCourse = courses.splice(index, 1);

    saveCourses(courses);

    res.status(200).json({
        message: "Course deleted successfully",
        course: deletedCourse[0]
    });
});

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Course Management API',
        endpoints: ['/courses', '/courses/:id']
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
