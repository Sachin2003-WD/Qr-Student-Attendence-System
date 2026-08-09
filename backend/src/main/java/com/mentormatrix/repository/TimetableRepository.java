package com.mentormatrix.repository;

import com.mentormatrix.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findByBatchIdAndDeletedFalse(Long batchId);
    List<Timetable> findByFacultyIdAndDeletedFalse(Long facultyId);
    List<Timetable> findByBatchIdAndDayOfWeekAndDeletedFalse(Long batchId, DayOfWeek dayOfWeek);
    List<Timetable> findByFacultyIdAndDayOfWeekAndDeletedFalse(Long facultyId, DayOfWeek dayOfWeek);
}
