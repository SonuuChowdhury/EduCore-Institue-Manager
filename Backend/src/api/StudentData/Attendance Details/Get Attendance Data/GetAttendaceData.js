import express from 'express';
import studentattendancedetails from '../../../../models/students/studentAttendanceDetails.js';

const GetStudentAttendanceDetails = express.Router();
GetStudentAttendanceDetails.use(express.json());

GetStudentAttendanceDetails.post('/api/student-dashboard/attendance', async (req, res) => {
  const {
    roll,
    getAttendance,
    startMonitoring,
    addSubject,
    NewTotalPresent,
    NewTotalAbsent,
    deleteSubject,
    subjectName,
    subjectType,
    updateAttendance,
    markPresent,
    markAbsent,
    removeMark
  } = req.body;

  if (!roll) {
    return res.status(400).json({ data: "Roll Number is required" });
  }

  // Start Monitoring
  if (startMonitoring) {
    const NewAttendanceMonitoringData = new studentattendancedetails({
      roll: roll,
      subjects: [],
    });
    const NewAttendanceMonitoringDataStatus = await NewAttendanceMonitoringData.save();
    if (!NewAttendanceMonitoringDataStatus) {
      return res.status(400).json({ msg: "Failed to start Monitoring" });
    } else {
      return res.status(200).json({ msg: "Monitoring started successfully" });
    }
  }




 // Update Attendance
if (updateAttendance) {
  try {
    // Find the student by roll
    const attendanceData = await studentattendancedetails.findOne({ roll: Number(roll) });

    if (!attendanceData) {
      return res.status(404).json({ msg: "No student found with this roll number" });
    }

    if (!subjectName) {
      return res.status(400).json({ msg: "Subject Name is required" });
    }

    const subject = attendanceData.subjects.find((subj) => subj.name === subjectName);

    if (!subject) {
      return res.status(404).json({ msg: "Subject not found" });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    if (removeMark) {
      const wasPresent = subject.PresentDates.some(
        (date) => new Date(date).toISOString().split('T')[0] === todayDate
      );
      const wasAbsent = subject.AbsentDates.some(
        (date) => new Date(date).toISOString().split('T')[0] === todayDate
      );

      if (!wasPresent && !wasAbsent) {
        return res.status(400).json({ msg: "Today's date is not marked as present or absent" });
      }

      if (wasPresent) {
        subject.TotalPresent = Math.max(0, subject.TotalPresent - (subject.isLab ? 2 : 1)); // Decrement by 2 for lab
        subject.PresentDates = subject.PresentDates.filter(
          (date) => new Date(date).toISOString().split('T')[0] !== todayDate
        );
      }

      if (wasAbsent) {
        subject.TotalAbsent = Math.max(0, subject.TotalAbsent - (subject.isLab ? 2 : 1)); // Decrement by 2 for lab
        subject.AbsentDates = subject.AbsentDates.filter(
          (date) => new Date(date).toISOString().split('T')[0] !== todayDate
        );
      }

      subject.LastUpdated = new Date();
      const updatedAttendance = await attendanceData.save();

      return res.status(200).json({
        msg: "Today's attendance removed successfully",
        data: updatedAttendance,
      });
    }

    if (markPresent) {
      const wasAbsent = subject.AbsentDates.some(
        (date) => new Date(date).toISOString().split('T')[0] === todayDate
      );

      if (wasAbsent) {
        subject.TotalAbsent = Math.max(0, subject.TotalAbsent - (subject.isLab ? 2 : 1)); // Decrement by 2 for lab
      }

      subject.AbsentDates = subject.AbsentDates.filter(
        (date) => new Date(date).toISOString().split('T')[0] !== todayDate
      );

      const wasAlreadyPresent = subject.PresentDates.some(
        (date) => new Date(date).toISOString().split('T')[0] === todayDate
      );

      if (!wasAlreadyPresent) {
        subject.PresentDates.push(new Date());
        subject.TotalPresent += (subject.isLab ? 2 : 1); // Increment by 2 for lab
      }
    } else if (markAbsent) {
      const wasPresent = subject.PresentDates.some(
        (date) => new Date(date).toISOString().split('T')[0] === todayDate
      );

      if (wasPresent) {
        subject.TotalPresent = Math.max(0, subject.TotalPresent - (subject.isLab ? 2 : 1)); // Decrement by 2 for lab
      }

      subject.PresentDates = subject.PresentDates.filter(
        (date) => new Date(date).toISOString().split('T')[0] !== todayDate
      );

      const wasAlreadyAbsent = subject.AbsentDates.some(
        (date) => new Date(date).toISOString().split('T')[0] === todayDate
      );

      if (!wasAlreadyAbsent) {
        subject.AbsentDates.push(new Date());
        subject.TotalAbsent += (subject.isLab ? 2 : 1); // Increment by 2 for lab
      }
    } else {
      return res.status(400).json({ msg: "Specify whether to mark present or absent" });
    }

    subject.LastUpdated = new Date();
    const updatedAttendance = await attendanceData.save();

    return res.status(200).json({
      msg: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Error updating attendance", error: error.message });
  }
}


  



  // Add Subject
  if (addSubject) {
    if (!subjectName) {
      return res.status(400).json({ msg: "Subject name is required to add a subject." });
    }
    if (!subjectType || ![1, 2].includes(subjectType)) {
      return res.status(400).json({ msg: "Invalid or missing subjectType. Use 1 for theory or 2 for lab." });
    }

    // Validate NewTotalPresent and NewTotalAbsent
    if (NewTotalPresent < 0 || isNaN(NewTotalPresent)) {
      return res.status(400).json({ msg: "Invalid NewTotalPresent value. It cannot be negative or invalid." });
    }
    if (NewTotalAbsent < 0 || isNaN(NewTotalAbsent)) {
      return res.status(400).json({ msg: "Invalid NewTotalAbsent value. It cannot be negative or invalid." });
    }
    try {
      const student = await studentattendancedetails.findOne({ roll: Number(roll) });
      if (!student) {
        return res.status(404).json({ msg: "Student not found." });
      }
      // Check if the subject already exists
      const subjectExists = student.subjects.some((subject) => subject.name === subjectName);
      if (subjectExists) {
        return res.status(400).json({ msg: "Subject already exists." });
      }
      // Add the new subject
      student.subjects.push({
        name: subjectName,
        startDate: new Date(),
        AbsentDates: [],
        PresentDates: [],
        TotalPresent: Number(NewTotalPresent) || 0,
        TotalAbsent: Number(NewTotalAbsent) || 0,
        subjectType: subjectType || 1, // Default to theory
      });
      const updatedStudent = await student.save();
      return res.status(200).json({ msg: "Subject added successfully", data: updatedStudent });
    } catch (error) {
      return res.status(500).json({ msg: "Error adding subject", error: error.message });
    }
  }
  


  if (deleteSubject) {
    if (!subjectName) {
      return res.status(400).json({ msg: "Subject name is required to delete a subject" });
    }
    try {
      // Find the student by roll
      const student = await studentattendancedetails.findOne({ roll: Number(roll) });
  
      if (!student) {
        return res.status(404).json({ msg: "Student not found" });
      }
  
      // Check if the subject exists
      const subjectIndex = student.subjects.findIndex((subject) => subject.name === subjectName);
      if (subjectIndex === -1) {
        return res.status(404).json({ msg: "Subject not found" });
      }
  
      // Remove the subject
      student.subjects.splice(subjectIndex, 1);
  
      // Save the updated data
      const updatedStudent = await student.save();
  
      return res.status(200).json({
        msg: "Subject deleted successfully",
        data: updatedStudent,
      });
    } catch (error) {
      return res.status(500).json({ msg: "Error deleting subject", error: error.message });
    }
  }
  

  // Get Attendance
  if (getAttendance) {
    const studentAttendanceData = await studentattendancedetails.findOne({ roll: Number(roll) });
    if (!studentAttendanceData) {
      return res.status(404).json({ msg: "Attendance data not found" });
    } else {
      return res.status(200).json({ data: studentAttendanceData });
    }
  }

  return res.status(400).json({ msg: "Select a parameter to do a task" });
});

export default GetStudentAttendanceDetails;
