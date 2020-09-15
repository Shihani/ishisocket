const express = require('express');
const http = require('http');
const socketio = require("socket.io");
const port = process.env.port | 4002;
const index = require("./index")
const app = express()
app.use(index)
const server = http.createServer(app);
const io = socketio(server);

const ROOM_PREFIX = "schedule";

let currentBreakoutRooms = []


io.on("connection", socket => {
    socket.on("user_connected", user => {
        const roomId = `${ROOM_PREFIX}` + `${user.scheduleId}`;
        socket.join(roomId)
        console.log("user user_connected " + roomId);
    });

    socket.on("note_received", note => {
        const roomId = `${ROOM_PREFIX}` + `${note.scheduleId}`;
        socket.to(roomId).emit("broadcast_note", note);
    });

    socket.on("receive_file", file => {
        const roomId = `${ROOM_PREFIX}` + `${file.scheduleId}`;
        socket.to(roomId).emit("broadcast_file", file);
    });

    socket.on("quiz_received", quiz => {
        const roomId = `${ROOM_PREFIX}` + `${quiz.scheduleId}`;
        socket.to(roomId).emit("broadcast_quiz", quiz.data);
    });

    socket.on("result_sent",data=>{
        const roomId = `${ROOM_PREFIX}` + `${data.scheduleId}`;
        io.in(roomId).emit("broadcast_answers", data);
    });

    socket.on("poll_received", quiz => {
        const roomId = `${ROOM_PREFIX}` + `${quiz.scheduleId}`;
        socket.to(roomId).emit("broadcast_poll", quiz.data);
    });

    socket.on("poll_sent",data=>{
        const roomId = `${ROOM_PREFIX}` + `${data.scheduleId}`;
        io.in(roomId).emit("broadcast_poll_answer", data);
    });

    socket.on("poll_publish", quiz => {
        const roomId = `${ROOM_PREFIX}` + `${quiz.scheduleId}`;
        socket.to(roomId).emit("publish_poll_answer", quiz.data);
    });

    socket.on("quiz_publish", quiz => {
        const roomId = `${ROOM_PREFIX}` + `${quiz.scheduleId}`;
        socket.to(roomId).emit("publish_quiz_answer", quiz.data);
    });

    socket.on("join_students_to_breakout_rooms", studentsData => {
        const roomId = `${ROOM_PREFIX}` + `${studentsData.scheduleId}`;
        let breakoutRoomsInCurrentSchedule = currentBreakoutRooms.filter(room => room.scheduleId == studentsData.scheduleId);
        breakoutRoomsInCurrentSchedule.forEach((room, i) => {

        });

        let breakoutRoom = {
            scheduleId: studentsData.scheduleId,
            id: currentBreakoutRooms.length,
            roomId: roomId,
            meetRoomName: studentsData.breakoutRoomName,
            meetRoomID: studentsData.subMeetRoom,
            students: studentsData.students
        }
        currentBreakoutRooms.push(breakoutRoom)
        studentsData["currentBreakoutRooms"] = currentBreakoutRooms
        io.in(roomId).emit("on_join_to_new_room", studentsData);
    });

    socket.on("on_join_to_parent_room", parentRoomData => {
        const roomId = `${ROOM_PREFIX}` + `${parentRoomData.scheduleId}`;
        let currBrRoomsTemp = currentBreakoutRooms.filter(room => room.scheduleId != parentRoomData.scheduleId);
        currentBreakoutRooms = currBrRoomsTemp
        socket.to(roomId).emit("join_to_parent", parentRoomData);
    });

    socket.on("breakout_room_user_connected", user => {
        const roomId = `${ROOM_PREFIX}` + `${user.scheduleId}`;
        socket.join(roomId)
        console.log("user user_connected " + roomId);
        socket.to(roomId).emit("get_breakout_rooms", currentBreakoutRooms);
    });


});


server.listen(port, () => {
    console.log(`Tuti socket server is running on  ${port}`)
})