import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { User } from 'generated/prisma';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateStepDto, UpdateStepDto } from './dto';
import { StepService } from './step.service';

@Controller('step')
@ApiBearerAuth('access-token')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  @ApiBody({
    description: 'Step data to create',
    type: CreateStepDto,
  })
  create(@Body() step: CreateStepDto, @CurrentUser() user: User) {
    return this.stepService.create({ step, user });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stepService.findOne(+id);
  }

  @Patch(':id')
  @ApiBody({
    description: 'Step data to create',
    type: UpdateStepDto,
  })
  update(
    @Param('id') id: string,
    @Body() step: UpdateStepDto,
    @CurrentUser() user: User,
  ) {
    return this.stepService.update({ id: +id, step, user });
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.stepService.remove({ id: +id, user });
  }

  @Post(':id/comment')
  addComment(@Param('id') id: number, @Body('text') text: string) {
    return this.stepService.addComment({
      id,
      text,
    });
  }

  @Patch('/comment/:id') // Move for another resource
  updateComment(@Param('id') id: number, @Body('text') text: string) {
    return this.stepService.updateComment({
      id,
      text,
    });
  }

  @Delete('/comment/:id')
  deleteComment(@Param(':id') id: number) {
    return this.stepService.deleteComment(id);
  }
}
