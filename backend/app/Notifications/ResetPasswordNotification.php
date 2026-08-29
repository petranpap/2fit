<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly string $token)
    {
        //
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * API-only app: the mobile client collects the token in-app rather than
     * following a web link, so the notification carries the raw token.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset your 2fit password')
            ->line('You requested a password reset.')
            ->line("Your reset code is: {$this->token}")
            ->line('Enter this code in the app along with your new password.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}
