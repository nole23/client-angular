import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {TenantService} from '../../../services/tenant-service/tenant.service';
import {SurveyService} from '../../../services/survey-service/survey.service';
import {AlertService} from '../../../services/alert-service/alert.service';

import {Survey} from '../../../models/survey/survey.model';
import {Tenant} from '../../../models/user/tenant.model';
import {UserResponse} from '../../../models/survey/user-response.model';

import {ConfirmationService} from 'primeng/primeng';
import {Answer} from '../../../models/survey/answer.model';
import {Question} from '../../../models/survey/question.model';
import {SurveyResponse} from '../../../models/survey/survey-response.model';

import {default as isValidDate} from 'pretty-easy-date-check';

@Component({
  selector: 'app-tenant-survey',
  templateUrl: './tenant-survey.component.html',
  styleUrls: ['./tenant-survey.component.scss']
})
export class TenantSurveyComponent implements OnInit {

  private messageDeleted = false;
  private messageAddQuestion = false;
  private messageFilled = false;
  private messageCreated = false;
  private messageNoResposes = false;
  private messageWrongDateFormat = false;
  private messageDatePassed = false;
  private messageQuestionDuplicate = false;

  private fillDialog = false;
  private reportDialog = false;
  private deleteDialog = false;
  private createSurveyDialog = false;

  private selectedSurvey: Survey = new Survey();

  private newSurvey: Survey = new Survey();
  private newQuestion: Question =
    new Question('', '', '');

  private surveys: any = [];
  private tenant: Tenant = new Tenant();

  private userResponse: UserResponse = new UserResponse();
  private surveyResponses: SurveyResponse[];

  constructor(private tenantService: TenantService,
              private surveyService: SurveyService,
              private alertService: AlertService,
              private confirmationService: ConfirmationService,
              private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    localStorage.setItem('sidebar', 'tenant');
    localStorage.setItem('navbarTitle', 'Ankete');

    this.activeRoute.params.subscribe(params => {
      this.tenant.id = params['id'];

      this.tenantService.getUsersTenants().subscribe(res => {
        const resTenant = res.filter(t => t.id === +this.tenant.id)[0];

        this.tenant.userId = resTenant.user.id;
        this.tenant.buildingId = resTenant.building.id;

        const tenantsFromToken = JSON.parse(localStorage.getItem('token'));

        tenantsFromToken.tenants.forEach(t => {
          if (t.tenant === this.tenant.id) {
            this.tenant.owner = t.owner;
            if (this.tenant.buildingId + '' === t.building + '') {
              if (t.supervisor !== null) {
                this.tenant.supervisor = true;
                console.log(this.tenant);
              }
            }
          }
        });
        this.getSurveys();
      });
    });
  }

  getSurveys() {
    this.surveyService.getSurveys(this.tenant.buildingId).subscribe((res: Array<any>) => {
      this.surveys = res;
    });
  }

  destroy() {
    this.surveyService.delete(this.selectedSurvey.id).subscribe(res => {
      const index = this.surveys.findIndex(s => s.id === this.selectedSurvey.id);
      this.surveys.splice(index, 1);
      this.resetMessageDivs();
      this.messageDeleted = true;
      this.deleteDialog = false;
    }, error => {
      alert('error');
    });
  }

  submit() {
    this.surveyService.fillOut(this.userResponse).subscribe(res => {
      this.resetMessageDivs();
      setTimeout(() => {
        this.hideFillDialog();
        this.getSurveys();
        this.resetMessageDivs();
        this.messageFilled = true;
      }, 250);
    }, err => {
      alert('nene');
    });
  }

  addQuestion() {
    let found = false;
    this.newSurvey.questionDTO.forEach(q => {
      if (q.question === this.newQuestion.question) {
        found = true;
        this.messageQuestionDuplicate = true;
        return;
      }
    });

    if (found) {
      return;
    }

    this.newSurvey.questionDTO.push(new Question(this.newQuestion.id,
      this.newQuestion.question,
      this.newQuestion.typeQuestion));

    this.newQuestion.id = '';
    this.newQuestion.question = '',
      this.newQuestion.typeQuestion = '';
  }

  createSurvey(obj: Survey) {
    if (obj.questionDTO.length < 3) {
      this.resetMessageDivs();
      this.messageAddQuestion = true;
      return;
    }

    if (isValidDate(new Date(obj.dateExpires))) {
      if (new Date(obj.dateExpires) < new Date()) {
        this.messageDatePassed = true;
        return;
      }
    } else {
      this.messageWrongDateFormat = true;
      return;
    }

    this.surveyService.create(obj).subscribe(res => {
      this.resetMessageDivs();

      setTimeout(() => {
        this.hideCreateDialog();
        this.getSurveys();
        this.messageCreated = true;
      }, 500);
    }, err => {
      alert('Error.');
    });
  }

  confirm(survey: Survey) {
    this.resetMessageDivs();
    this.deleteDialog = true;
    this.selectedSurvey = survey;
    this.confirmationService.confirm({
      message: 'Da li ste sigurni da želite da obrišete anketu?',
      header: 'Potvrda',
      icon: 'fa fa-question-circle'
    });
  }

  private openFillDialog(survey: Survey) {
    this.selectedSurvey = survey;
    this.fillResponseWithQuestions();
    this.fillDialog = true;
  }

  private openReportDialog(surveyId) {
    this.surveyService.getSurveys(this.tenant.buildingId).subscribe((res: Array<any>) => {
      this.surveys = res;
      let survey;
      this.surveys.forEach(s => {
        if (s.id === surveyId) {
          survey = s;
        }
      });
      setTimeout(() => {
        if (survey.userResponses.length < 1) {
          this.resetMessageDivs();
          this.messageNoResposes = true;
          return;
        }
        this.surveyResponses = [];
        this.surveyResponses = this.surveyService.surveyStatistics(survey);
        this.reportDialog = true;
      }, 50);
    });
  }

  private openCreateDialog() {
    this.newSurvey.questionDTO = new Array<Question>();
    this.newSurvey.building = this.tenant.buildingId;
    this.createSurveyDialog = true;
  }

  private hideFillDialog() {
    this.fillDialog = false;
  }

  private hideReportDialog() {
    this.reportDialog = false;
  }

  private hideCreateDialog() {
    this.createSurveyDialog = false;
  }

  private resetMessageDivs() {
    this.messageDeleted = false;
    this.messageAddQuestion = false;
    this.messageCreated = false;
    this.messageFilled = false;
    this.messageNoResposes = false;
    this.messageDatePassed = false;
    this.messageWrongDateFormat = false;
    this.messageQuestionDuplicate = false;
  }

  private fillResponseWithQuestions() {
    this.userResponse.answers = [];
    this.userResponse.survey = this.selectedSurvey.id;
    this.selectedSurvey.questionDTO.forEach(q => {
      this.userResponse.answers.push(new Answer(q));
    });
  }

  private fillAllowed(userResponses) {
    let found = false;
    userResponses.forEach(ur => {
      if (ur.user === this.tenant.userId) {
        found = true;
      }
    });

    return found;
  }
}
