package com.bfocus;

import android.app.Service;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.Intent;
import android.os.Bundle;
import android.os.IBinder;
import android.support.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class BackgroundService extends JobService {

    public void sendService() {
        Intent service = new Intent(getApplicationContext(), BackgroundTask.class);
        Bundle bundle = new Bundle();

        bundle.putString("foo", "bar");
        service.putExtras(bundle);

        getApplicationContext().startService(service);
        System.out.println("---> Send from service background to react");
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        sendService();
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return false;
    }

}
