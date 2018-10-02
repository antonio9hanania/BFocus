package com.bfocus;

import com.facebook.react.ReactActivity;

import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;

import com.bfocus.screenbridge.ScreenBridgeModule;

import java.util.concurrent.TimeUnit;

public class MainActivity extends ReactActivity{
    public static final String IS_JOB_FIRST_RUN = "job";
    private BroadcastReceiver myReceiver;

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onNewIntent(Intent intent) {
       super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_ON);

        filter.addAction(Intent.ACTION_SCREEN_OFF);
        filter.addAction(Intent.ACTION_USER_PRESENT);

// Customized BroadcastReceiver class
//Will be defined soon..

        myReceiver = new ScreenReceiver();
        registerReceiver(myReceiver, filter);

        startService(new Intent(this, MyService.class));
        checkIfFirstTimeToSetJobScheduler();
    }

    private void checkIfFirstTimeToSetJobScheduler() {
        /*SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        System.out.println("---> Checking if need to define job Scheduler The value of boolean is: " + preferences.getBoolean(IS_JOB_FIRST_RUN, true));
        if (preferences.getBoolean(IS_JOB_FIRST_RUN, true)) {
            jobSchedulerStart();
            preferences.edit().putBoolean(IS_JOB_FIRST_RUN, false).apply();
            System.out.println("---> Job scheduler has been defined for the first time.");
        }*/
        System.out.println("---> Checking if need to define job Scheduler");
        if(!isJobServiceOn()) {
            jobSchedulerStart();
            System.out.println("---> Job scheduler has been defined for the first time.");
        }
    }

    public boolean isJobServiceOn() {
        JobScheduler jobScheduler =
                (JobScheduler) getSystemService(Context.JOB_SCHEDULER_SERVICE);

        boolean hasBeenScheduled = false ;

        for ( JobInfo jobInfo : jobScheduler.getAllPendingJobs() ) {
            if ( jobInfo.getId() == 1 ) {
                hasBeenScheduled = true ;
                break ;
            }
        }

        return hasBeenScheduled ;
    }

    private void jobSchedulerStart() {
        JobScheduler jobScheduler =
                (JobScheduler) getSystemService(Context.JOB_SCHEDULER_SERVICE);
        int result = jobScheduler.schedule(new JobInfo.Builder( 1,
                        new ComponentName(this, BackgroundService.class))
                        .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY).setPeriodic(900000)
                        .build() );

        if (result == JobScheduler.RESULT_SUCCESS) {
            System.out.println("---> Job scheduler defined the background service successfully");
        } else {
            System.out.println("---> Job scheduler has failed to define background service");
        }
    }

    @Override
    public void onDestroy()
    {
        super.onDestroy();
        if (myReceiver != null)
        {
            unregisterReceiver(myReceiver);
            myReceiver = null;
        }
    }

    @Override
    protected String getMainComponentName() {
        return "BFocus";
    }

    private class ScreenReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent.getAction().equals(Intent.ACTION_SCREEN_OFF)) {
                ScreenBridgeModule.sendEvent("ACTION_SCREEN_OFF");
            } else if (intent.getAction().equals(Intent.ACTION_SCREEN_ON)) {
                ScreenBridgeModule.sendEvent("ACTION_SCREEN_ON");
            } else if (intent.getAction().equals(Intent.ACTION_USER_PRESENT)) {
                ScreenBridgeModule.sendEvent("ACTION_USER_PRESENT");
            }
        }
    }
}
