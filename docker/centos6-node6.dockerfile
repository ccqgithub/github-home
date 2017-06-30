# 操作系统
FROM centos:6.8

# 管理员
MAINTAINER "season.chen" <season.chen.i@foxmail.com>

#设置时区与语言
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/TZ /etc/localtime && echo TZ /etc/localtime && echo TZ > /etc/timezone

# 准备工作
WORKDIR /home/

RUN echo 'yum version ' \
&& yum --version \
&& echo '----------------yum update start-------------------' \
&& yum -y update \
&& echo '----------------yum update success-------------------'

# wget
RUN echo '----------------install wget start-------------------' \
&& yum -y install wget \
&& echo '----------------install wget success-------------------'

# epel
RUN echo '----------------install epel start-------------------' \
&& yum -y install epel-release \
&& echo '----------------install epel success-------------------'

# gcc
RUN echo '----------------install gcc start-------------------' \
&& yum -y install centos-release-scl-rh centos-release-scl \
&& yum -y check-update \
&& yum -y install devtoolset-3-gcc devtoolset-3-gcc-c++ \
&& source /opt/rh/devtoolset-3/enable \
&& gcc -v \
&& echo '----------------install gcc success-------------------'

# nodejs
RUN echo '----------------install nodejs start-------------------' \
&& curl --silent --location https://rpm.nodesource.com/setup_6.x | bash - \
&& yum -y install nodejs \
&& node --version \
&& echo '----------------install nodejs success-------------------'

# node 全局包
RUN echo '--------------------install global npm start---------------' \
&& npm config set registry=https://registry.npm.taobao.org \
&& npm config set sass-binary-site=http://npm.taobao.org/mirrors/node-sass \
&& npm install -g fis3 \
&& npm install -g pm2 \
&& fis3 --version \
&& pm2 --version \
&& echo '--------------------install global npm success---------------'

# yarn
RUN echo '-----------------install yarn start------------------' \
&& wget https://dl.yarnpkg.com/rpm/yarn.repo -O /etc/yum.repos.d/yarn.repo \
&& curl --silent --location https://rpm.nodesource.com/setup_6.x | bash - \
&& yum -y install yarn \
&& yarn ---version \
&& echo '-----------------install yarn success------------------'

# git
RUN echo '------------------install git start-----------------' \
&& source /opt/rh/devtoolset-3/enable \
&& yum -y install curl-devel expat-devel gettext-devel openssl-devel zlib-devel perl-devel \
&& wget https://github.com/git/git/archive/v2.12.0.tar.gz -O git-v2.12.0.tar.gz \
&& tar -zxvf git-v2.12.0.tar.gz \
&& cd git-2.12.0 \
&& make configure \
&& ./configure --prefix=/usr/local \
&& make && make install \
&& git --version \
&& echo '------------------install git success-----------------'

## libvips
RUN echo '------------------install libvips start-----------------' \
&& source /opt/rh/devtoolset-3/enable \
&& yum -y install glib2-devel \
&& wget https://github.com/jcupitt/libvips/releases/download/v8.5.6/vips-8.5.6.tar.gz -O vips-8.5.6.tar.gz \
&& tar xf vips-8.5.6.tar.gz \
&& cd vips-8.5.6 \
&& ./configure \
&& make \
&& make install \
&& echo '------------------install libvips success-----------------'
