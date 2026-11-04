#!/bin/sh
# Keep the Travis job open until Travis has archived this job's log up to the
# script phase's result line. Travis aggregates log parts asynchronously, and
# the seal harness reads each job's log as soon as the build finishes, so
# without this the harvested log can stop before the test results.
# after_script cannot change the job's result.
url="https://api.travis-ci.com/v3/job/${TRAVIS_JOB_ID}/log.txt"
pattern='The command ".*" exited with [0-9]+'
i=0
while [ "$i" -lt 90 ]; do
	if curl -fsSL "$url" 2>/dev/null | grep -Eq "$pattern"; then
		echo "wait-for-log: results are archived"
		exit 0
	fi
	i=$((i + 1))
	sleep 20
done
echo "wait-for-log: archive still incomplete after 30 minutes"
