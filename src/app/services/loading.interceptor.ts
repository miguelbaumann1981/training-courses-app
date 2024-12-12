import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { LoadingService } from "../loading/loading.service";
import { finalize } from "rxjs";
import { skipLoading } from "../loading/skip-loading.component";


export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    if(req.context.get(skipLoading)) {
        return next(req);
    }
    
    const loadingService = inject(LoadingService);
    loadingService.loadingOn();

    return next(req).pipe(
        finalize(() => {
            loadingService.loadingOff();
        })
    );
}