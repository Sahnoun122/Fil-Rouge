import { Controller, Get, Param } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Public } from '../auth/auth.controller';
import { PlanType } from './entities/plan.entity';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // 📋 === INFORMATIONS PUBLIQUES SUR LES PLANS ===

  @Public()
  @Get()
  async getAllPlans() {
    return this.plansService.getAllPlans();
  }

  @Public()
  @Get('pricing')
  async getPricingInfo() {
    return this.plansService.getPricingInfo();
  }

  @Public()
  @Get('compare')
  async comparePlans() {
    return this.plansService.comparePlans();
  }

  @Public()
  @Get(':type')
  async getPlanByType(@Param('type') type: PlanType) {
    return this.plansService.getPlanByType(type);
  }

  @Public()
  @Get(':type/features')
  async getPlanFeatures(@Param('type') type: PlanType) {
    return this.plansService.getPlanFeatures(type);
  }
}