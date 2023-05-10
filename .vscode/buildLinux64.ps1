$arch = 'Linux64'


$appName = (Get-Content package.json | ConvertFrom-Json).name
$electronVer = (Get-Content package.json | ConvertFrom-Json).devDependencies.electron
$buildDir = "_build/$arch/$appName"

rm -r -ErrorAction Ignore $buildDir
cp -Recurse -Force D:/Desarrollo/ElectronBinaries/$electronVer/$arch/ $buildDir

mkdir $buildDir/resources/app
cp package.json $buildDir/resources/app
cp icon64.png $buildDir/resources/app
cp -Recurse src/ $buildDir/resources/app

cd $buildDir/resources
rm app/src/res/*.map
asar p app/ app.asar
rm -r app/

cd ..
mv electron "$appName"