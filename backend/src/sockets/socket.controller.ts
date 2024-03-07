import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ChannelService } from '../channel/channel.service';
import { find } from 'rxjs';
//import { ChannelService } from '../channel/channel.service';

//@Controller('socket')
//export class SocketController {
//    constructor(
//        private readonly userService: UsersService,
//        private channelService: ChannelService,
//    ) {}

//    //@Get('getonlineusers')
//    //async GetOnlineUsers() {
//    //    const onlineUsersArray = await this.userService.findAllOnlineUsers();
//    //    return onlineUsersArray;
//    //}

//    //@Get('getallusers')
//    //async GetAllUsers() {
//    //    const allUsersArray = await this.userService.findAllUsers();
//    //    return allUsersArray;
//    //}

//    //@Get('getofflineusers')
//    //async GetOfflineUsers() {
//    //    const offlineUsersArray = await this.userService.findAllOfflineUsers();
//    //    return offlineUsersArray;
//    //}

//    //@Get('getallchannels')
//    //async GetOnlineChannels() {
//    //    const channelsList = await this.channelService.findAllChannels();
//    //    return channelsList;
//    //}

//    //@Post('getchannels')
//    //async GetChannels(@Body() body: any) {
//    //    const channelsList = await this.channelService.findChannels(
//    //        body.userId,
//    //    );
//    //    return channelsList;
//    //}

//    //@Post('gethistory')
//    //async GetHistory(@Body() body: any) {
//    //    const history = await this.userService.findHistory(body);
//    //    return history;
//    //}

//    //@Post('getchannelhistory')
//    //async GetChannelHistory(@Body() body: any) {
//    //    const history = await this.channelService.findChannelHistory(body);
//    //    return history;
//    //}

//    //@Post('createchannel')
//    //async CreateChannel(@Body() body: { name: string }) {
//    //    const channel = await this.channelService.createChannel(body.name);
//    //    return channel;
//    //}

//    //@Post('leavechannel')
//    //async LeaveChannel(
//    //    @Body()
//    //    body: {
//    //        channelName: string;
//    //        channelId: number;
//    //        userId: number;
//    //        userName: string;
//    //    },
//    //) {
//    //    const channelUser = await this.channelService.leaveChannel(
//    //        body.channelId,
//    //        body.userId,
//    //    );
//    //    return channelUser.count;
//    //}
//}
