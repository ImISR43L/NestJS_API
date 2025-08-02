import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { GroupService } from './group.service';
import {
  CreateGroupDto,
  UpdateGroupDto,
  CreateGroupMessageDto,
  ManageMemberDto,
} from './dto/group.dto';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Groups')
@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Req() req: Request) {
    return this.groupService.create(createGroupDto, req.user['id']);
  }

  @Get('/discover')
  findAllDiscoverable() {
    return this.groupService.findAllDiscoverable();
  }

  @Get('/mine')
  findMyGroups(@Req() req: Request) {
    return this.groupService.findUserGroups(req.user['id']);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() req: Request,
  ) {
    return this.groupService.update(id, updateGroupDto, req.user['id']);
  }

  @Delete(':id')
  deleteGroup(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.groupService.deleteGroup(id, req.user['id']);
  }

  @Post(':id/join')
  join(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.groupService.joinGroup(id, req.user['id']);
  }

  @Delete(':id/leave')
  @HttpCode(HttpStatus.OK)
  leave(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.groupService.leaveGroup(id, req.user['id']);
  }

  @Get(':id/messages')
  getMessages(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.groupService.getMessages(id, req.user['id']);
  }

  @Post(':id/messages')
  postMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() createMessageDto: CreateGroupMessageDto,
  ) {
    return this.groupService.postMessage(id, req.user['id'], createMessageDto);
  }

  @Post(':id/members/:userId/approve')
  approveRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: Request,
  ) {
    return this.groupService.approveRequest(id, userId, req.user['id']);
  }

  @Patch(':id/members')
  manageMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() manageDto: ManageMemberDto,
  ) {
    return this.groupService.manageMemberRole(id, req.user['id'], manageDto);
  }

  @Delete(':id/members/:userId/kick')
  @ApiOperation({ summary: 'Kick a member from a group (Admin/Owner only)' })
  kickMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: Request,
  ) {
    return this.groupService.kickMember(id, req.user['id'], userId);
  }

  @Delete(':id/members/:userId/reject')
  @ApiOperation({ summary: 'Reject a pending join request (Admin/Owner only)' })
  rejectRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: Request,
  ) {
    return this.groupService.rejectRequest(id, userId, req.user['id']);
  }
}
