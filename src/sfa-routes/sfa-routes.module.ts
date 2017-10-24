import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { OauthService } from './oauth.service';

// routes...
import { IndexRouteComponent } from './index/index-route.component';
import { AccountRouteComponent } from './account/account-route.component';
import { SignInRouteComponent } from './sign-in/sign-in-route.component';
import { SignOutRouteComponent } from './sign-out/sign-out-route.component';
import { AddPasswordRouteComponent } from './add-password/add-password-route.component';
import { UnlinkRouteComponent } from './unlink/unlink-route.component';
import { LinkRouteComponent } from './link/link-route.component';
import { ChangePasswordRouteComponent } from './change-password/change-password-route.component';
import { ChangeEmailRouteComponent } from './change-email/change-email-route.component';
import { ResetPasswordRouteComponent } from './reset-password/reset-password-route.component';
import { VerifyEmailRouteComponent } from './verify-email/verify-email-route.component';
import {
  RecoverEmailRouteComponent
} from './recover-email/recover-email-route.component';
import {
  SendResetPasswordLinkRouteComponent
} from './send-reset-password-link/send-reset-password-link-route.component';
import {
  SendEmailVerificationLinkRouteComponent
} from './send-email-verification-link/send-email-verification-link-route.component';
import { ReauthenticateRouteComponent } from './reauthenticate/reauthenticate-route.component';

// forms...
import { PersistenceFormComponent } from './persistence-form/persistence-form.component';
import { EmailSignInFormComponent } from './sign-in/email-sign-in-form.component';
import { OauthSignInComponent } from './sign-in/oauth-sign-in.component';


// utilities...
import { ToggleablePasswordComponent } from './util/toggleable-password.component';
import { InvalidFeedbackDirective } from './util/invalid-feedback.directive';
import { InvalidInputDirective } from './util/invalid-input.directive';
import { ProviderLabelComponent } from './util/provider-label.component';
import { ProviderIconComponent } from './util/provider-icon.component';
import { ProvidersListPhraseComponent } from './util/providers-list-phrase.component';
import { ProviderTitleDirective } from './util/provider-title.directive';
import { ApplicationLabelComponent } from './util/application-label.component';
import { IconWaitComponent } from './util/icon-wait.component';
import { IconSuccessComponent } from './util/icon-success.component';
import { IconWarningComponent } from './util/icon-warning.component';

const routes: Routes = [
  {path: '', children: [
    {path: 'reauthenticate', component: ReauthenticateRouteComponent},
    {path: 'send-email-verification-link', component: SendEmailVerificationLinkRouteComponent},
    {path: 'recover-email', component: RecoverEmailRouteComponent},
    {path: 'verify-email', component: VerifyEmailRouteComponent},
    {path: 'reset-password', component: ResetPasswordRouteComponent},
    {path: 'send-reset-password-link', component: SendResetPasswordLinkRouteComponent},
    {path: 'change-email', component: ChangeEmailRouteComponent},
    {path: 'change-password', component: ChangePasswordRouteComponent},
    {path: 'unlink', component: UnlinkRouteComponent},
    {path: 'link', component: LinkRouteComponent},
    {path: 'add-password', component: AddPasswordRouteComponent},
    {path: 'account', component: AccountRouteComponent},
    {path: 'sign-in', component: SignInRouteComponent},
    {path: 'sign-out', component: SignOutRouteComponent},
    {path: '', component: IndexRouteComponent},

  ]}
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    IndexRouteComponent,
    SignInRouteComponent,
    AccountRouteComponent,
    SignOutRouteComponent,
    AddPasswordRouteComponent,
    UnlinkRouteComponent,
    ChangePasswordRouteComponent,
    ChangeEmailRouteComponent,
    SendResetPasswordLinkRouteComponent,
    ResetPasswordRouteComponent,

    ToggleablePasswordComponent,
    InvalidFeedbackDirective,
    InvalidInputDirective,
    PersistenceFormComponent,
    ProviderLabelComponent,
    ProviderIconComponent,
    ProvidersListPhraseComponent,
    EmailSignInFormComponent,
    ProviderTitleDirective,
    ApplicationLabelComponent,
    LinkRouteComponent,
    OauthSignInComponent,
    VerifyEmailRouteComponent,
    RecoverEmailRouteComponent,
    SendEmailVerificationLinkRouteComponent,
    IconWaitComponent,
    IconSuccessComponent,
    IconWarningComponent,
    ReauthenticateRouteComponent,

  ],

  providers: [
    OauthService
  ]
})
export class SfaRoutesModule { }
