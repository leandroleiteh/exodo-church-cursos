$(document).ready(function() {
    let courses = JSON.parse(localStorage.getItem('courses')) || [];
    let currentCourseIndex = null;

    function saveCourses() {
        localStorage.setItem('courses', JSON.stringify(courses));
    }

    function renderCourses() {
        $('#course-list').empty();
        courses.forEach((course, index) => {
            $('#course-list').append(`
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${course.name}</h5>
                        <p class="card-text">Dia: ${course.day}, Horário: ${course.time}</p>
                        <button class="btn btn-success" onclick="markAttendance(${index})">Fazer Chamada</button>
                        <button class="btn btn-warning" onclick="editCourse(${index})">Editar</button>
                        <button class="btn btn-danger" onclick="deleteCourse(${index})">Deletar</button>
                        <button class="btn btn-info" onclick="manageStudents(${index})">Gerenciar Alunos</button>
                        <button class="btn btn-secondary" onclick="generateReport(${index}, 'csv')">Gerar Relatório CSV</button>
                        <button class="btn btn-secondary" onclick="generateReport(${index}, 'pdf')">Gerar Relatório PDF</button>
                    </div>
                </div>
            `);
        });
    }

    $('#add-course-btn').click(function() {
        $('#courseModal').modal('show');
    });

    $('#course-form').submit(function(event) {
        event.preventDefault();
        const courseName = $('#course-name').val().trim();
        const courseDay = $('#course-day').val();
        const courseTime = $('#course-time').val();
        if (courseName === "") {
            alert("O nome do curso não pode estar vazio.");
            return;
        }
        courses.push({ name: courseName, day: courseDay, time: courseTime, students: [], attendance: [] });
        saveCourses();
        $('#courseModal').modal('hide');
        renderCourses();
        alert("Curso adicionado com sucesso!");
    });

    window.markAttendance = function(index) {
        currentCourseIndex = index;
        const course = courses[index];
        let attendanceHtml = `<h5>Frequência para o curso: ${course.name}</h5>`;
        const today = new Date().toLocaleDateString();
        attendanceHtml += `<p>Data: ${today}</p>`;
        course.students.forEach((student, studentIndex) => {
            attendanceHtml += `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="attendance-${index}-${studentIndex}">
                    <label class="form-check-label" for="attendance-${index}-${studentIndex}">
                        ${student.name}
                    </label>
                </div>
            `;
        });
        attendanceHtml += `<button class="btn btn-primary mt-3" onclick="saveAttendance()">Salvar Frequência</button>`;
        $('#attendance-list').html(attendanceHtml);
        $('#main-view').addClass('d-none');
        $('#attendance-view').removeClass('d-none');
        renderPastAttendance(course);
    };

    function renderPastAttendance(course) {
        let pastAttendanceHtml = `<h5>Chamadas Anteriores</h5>`;
        course.attendance.forEach((att, attIndex) => {
            pastAttendanceHtml += `<p>Data: ${att.date}</p>`;
            att.students.forEach((student, studentIndex) => {
                pastAttendanceHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="past-attendance-${attIndex}-${studentIndex}" ${student.present ? 'checked' : ''} disabled>
                        <label class="form-check-label" for="past-attendance-${attIndex}-${studentIndex}">
                            ${student.name}
                        </label>
                    </div>
                `;
            });
        });
        $('#past-attendance-list').html(pastAttendanceHtml);
    }

    window.saveAttendance = function() {
        const course = courses[currentCourseIndex];
        const today = new Date().toLocaleDateString();
        const attendance = { date: today, students: [] };
        course.students.forEach((student, studentIndex) => {
            const present = $(`#attendance-${currentCourseIndex}-${studentIndex}`).is(':checked');
            attendance.students.push({ name: student.name, present });
        });
        course.attendance.push(attendance);
        saveCourses();
        $('#attendance-view').addClass('d-none');
        $('#main-view').removeClass('d-none');
        alert("Frequência salva com sucesso!");
    };

    window.editCourse = function(index) {
        const course = courses[index];
        $('#course-name').val(course.name);
        $('#course-day').val(course.day);
        $('#course-time').val(course.time);
        $('#courseModal').modal('show');
        $('#course-form').off('submit').submit(function(event) {
            event.preventDefault();
            const updatedName = $('#course-name').val().trim();
            if (updatedName === "") {
                alert("O nome do curso não pode estar vazio.");
                return;
            }
            course.name = updatedName;
            course.day = $('#course-day').val();
            course.time = $('#course-time').val();
            saveCourses();
            $('#courseModal').modal('hide');
            renderCourses();
            alert("Curso atualizado com sucesso!");
        });
    };

    window.deleteCourse = function(index) {
        if (confirm("Tem certeza que deseja deletar este curso?")) {
            courses.splice(index, 1);
            saveCourses();
            renderCourses();
            alert("Curso deletado com sucesso!");
        }
    };

    window.manageStudents = function(courseIndex) {
        currentCourseIndex = courseIndex;
        const course = courses[courseIndex];
        let studentsHtml = `<h5>Alunos do curso: ${course.name}</h5>`;
        course.students.forEach((student, studentIndex) => {
            studentsHtml += `
                <div class="col-md-4">
                    <div class="card animate__animated animate__fadeIn">
                        <div class="card-body">
                            <span>${student.name}</span>
                            <button class="btn btn-warning btn-sm" onclick="editStudent(${courseIndex}, ${studentIndex})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="removeStudent(${courseIndex}, ${studentIndex})">Remover</button>
                        </div>
                    </div>
                </div>
            `;
        });
        $('#student-list').html(studentsHtml);
        $('#main-view').addClass('d-none');
        $('#student-management-view').removeClass('d-none');
    };

    $('#add-student-btn').click(function() {
        $('#studentModal').modal('show');
    });

    $('#student-form').submit(function(event) {
        event.preventDefault();
        const studentName = $('#student-name').val().trim();
        if (studentName === "") {
            alert("O nome do aluno não pode estar vazio.");
            return;
        }
        courses[currentCourseIndex].students.push({ name: studentName });
        saveCourses();
        $('#studentModal').modal('hide');
        manageStudents(currentCourseIndex);
        alert("Aluno adicionado com sucesso!");
    });

    window.editStudent = function(courseIndex, studentIndex) {
        const student = courses[courseIndex].students[studentIndex];
        $('#student-name').val(student.name);
        $('#studentModal').modal('show');
        $('#student-form').off('submit').submit(function(event) {
            event.preventDefault();
            const updatedName = $('#student-name').val().trim();
            if (updatedName === "") {
                alert("O nome do aluno não pode estar vazio.");
                return;
            }
            student.name = updatedName;
            saveCourses();
            $('#studentModal').modal('hide');
            manageStudents(courseIndex);
            alert("Aluno atualizado com sucesso!");
        });
    };

    window.removeStudent = function(courseIndex, studentIndex) {
        if (confirm("Tem certeza que deseja remover este aluno?")) {
            courses[courseIndex].students.splice(studentIndex, 1);
            saveCourses();
            manageStudents(courseIndex);
            alert("Aluno removido com sucesso!");
        }
    };

    $('#back-to-courses-btn, #back-to-courses-btn-2').click(function() {
        $('#student-management-view, #attendance-view').addClass('d-none');
        $('#main-view').removeClass('d-none');
    });

    window.generateReport = function(courseIndex, format) {
        const course = courses[courseIndex];
        if (format === 'csv') {
            generateCSVReport(course);
        } else if (format === 'pdf') {
            generatePDFReport(course);
        }
    }
    function generateCSVReport(course) {
            const data = [];
            data.push(['Nome do Curso', course.name]);
            data.push(['Dia', course.day]);
            data.push(['Horário', course.time]);
            data.push([]);
            data.push(['Alunos Inscritos']);
            course.students.forEach(student => {
                data.push([student.name]);
            });
            data.push([]);
            data.push(['Data', 'Aluno', 'Presença']);
            course.attendance.forEach(att => {
                att.students.forEach(student => {
                    data.push([att.date, student.name, student.present ? 'Presente' : 'Faltou']);
                });
            });

            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            link.href = URL.createObjectURL(blob);
                    link.download = `Relatório_${course.name}.csv`;
                    link.click();
                }

                function generatePDFReport(course) {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();

                    doc.setFontSize(16);
                    doc.text(`Relatório do Curso: ${course.name}`, 10, 10);
                    doc.setFontSize(12);
                    doc.text(`Dia: ${course.day}`, 10, 20);
                    doc.text(`Horário: ${course.time}`, 10, 30);
                    doc.text(`Alunos Inscritos:`, 10, 40);
                    course.students.forEach((student, index) => {
                        doc.text(`- ${student.name}`, 10, 50 + (index * 10));
                    });

                    let yOffset = 60 + (course.students.length * 10);
                    doc.text(`Frequência:`, 10, yOffset);
                    course.attendance.forEach((att, attIndex) => {
                        yOffset += 10;
                        doc.text(`Data: ${att.date}`, 10, yOffset);
                        att.students.forEach((student, studentIndex) => {
                            yOffset += 10;
                            doc.text(`- ${student.name}: ${student.present ? 'Presente' : 'Faltou'}`, 10, yOffset);
                        });
                    });

                    doc.save(`Relatório_${course.name}.pdf`);
                }

                renderCourses();
            });