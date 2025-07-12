import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-user-chat-bot',
  templateUrl: './user-chat-bot.component.html',
  styleUrls: ['./user-chat-bot.component.scss']
})
export class UserChatBotComponent {


  chatOpen = false;
messages: any[] = [];
userInput = '';

toggleChat() {
  this.chatOpen = !this.chatOpen;
}

sendMessage() {
  if (!this.userInput.trim()) return;
  this.messages.push({ text: this.userInput, sender: 'user' });

  // this.dataRoomApiService.askBot(this.userInput).subscribe((res) => {
  //   this.messages.push({ text: res.response, sender: 'bot' });
  // });

  this.userInput = '';
}
closeChatPanel() {
  this.chatOpen = false; 
}
  @Output() closeChat = new EventEmitter<void>();

  closeChatWindow() {
    this.closeChat.emit();
  }
}
