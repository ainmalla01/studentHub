import * as service from "src/services/student.service.js";
import { ok } from "src/utils/response.js";
import { uuidParam } from "src/validators/common.js";
import {
  createStudentSchema,
  studentIdSchema,
  studentQuerySchema,
  updateStudentSchema,
} from "src/validators/student.validator.js";

export const createStudent = async (req, res) =>
  ok(
    res,
    await service.createStudent(createStudentSchema.parse(req.body), req.user.collegeId),
    "Student created.",
    201,
  );

export const getStudents = async (req, res) =>
  ok(res, await service.getStudents(studentQuerySchema.parse(req.query), req.user.collegeId));

export const getStudentCount = async (req, res) =>
  ok(res, { total: await service.getTotalStudents(req.user.collegeId) });

export const getStudent = async (req, res) =>
  ok(res, await service.getStudentById(uuidParam.parse(req.params).id, req.actor));

export const getStudentByStudentId = async (req, res) =>
  ok(
    res,
    await service.getStudentByStudentId(
      studentIdSchema.parse(req.params).studentId,
      req.user.collegeId,
    ),
  );

export const updateStudent = async (req, res) =>
  ok(
    res,
    await service.updateStudent(
      uuidParam.parse(req.params).id,
      req.user.collegeId,
      updateStudentSchema.parse(req.body),
    ),
    "Student updated.",
  );

export const deleteStudent = async (req, res) => {
  await service.deleteStudent(uuidParam.parse(req.params).id, req.user.collegeId);
  res.status(204).send();
};

export const resetStudentCredentials = async (req, res) =>
  ok(
    res,
    await service.resetStudentCredentials(uuidParam.parse(req.params).id, req.user.collegeId),
    "New temporary credentials issued.",
  );

export const getStudentStats = async (req, res) =>
  ok(res, await service.getStudentStats(uuidParam.parse(req.params).id, req.actor));
