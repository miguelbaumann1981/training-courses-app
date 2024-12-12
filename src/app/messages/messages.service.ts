import {Injectable, signal} from "@angular/core";
import {Message, MessageSeverity} from "../models/message.model";


@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  private messageSignal = signal<Message | null>(null);

  public message = this.messageSignal.asReadonly();

  showMessage(text: string, severity: MessageSeverity) {
    this.messageSignal.set({
      text,
      severity
    })
  }

  clear() {
    this.messageSignal.set(null);
  }


}
